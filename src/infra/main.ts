import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from "cors";
import swaggerRouter from './api/swagger';
import { NextFunction, Request, Response } from 'express';
import { DomainError } from '../domain/error/DomainError';
import healthRouter from './api/healthRouter';
import multer from "multer";
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import processRouter from './api/processRouter';
import { processStatusMessageHandler } from './config/di-config';

const app = express();
app.use(express.json());
app.use(cors());

const upload = multer();

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: "http://localhost:4566", // MinIO/LocalStack
  credentials: {
    accessKeyId: "minioadmin",
    secretAccessKey: "minioadmin",
  },
  forcePathStyle: true,
});

app.post("/upload", upload.single("video"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  const params = {
    Bucket: "meu-bucket",
    Key: req.file.originalname,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(params));
    res.send("Upload realizado com sucesso!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao enviar para o S3");
  }
});

app.get("/download/:filename", async (req, res) => {
  const filename = req.params.filename;
  const params = {
    Bucket: "process-videos",
    Key: filename,
  };

  try {
    const data = await s3.send(new GetObjectCommand(params));
    res.setHeader("Content-Type", data.ContentType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    if (data.Body) {
      (data.Body as NodeJS.ReadableStream).pipe(res);
    } else {
      res.status(404).send("Arquivo não encontrado");
    }
  } catch (err) {
    console.error(err);
    res.status(404).send("Arquivo não encontrado");
  }
});


app.use(processRouter);
app.use(healthRouter);
app.use(swaggerRouter);


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    if (err instanceof DomainError) {
        res.status(400).json({ message: err.message });
        return;
    }

    res.status(500).send({ message: 'Ocorreu um erro inesperado.' });
});

const PORT = process.env.SERVER_PORT || 3000;

// Inicializar processamento de mensagens em background
processStatusMessageHandler.startProcessing()
    .then(() => console.log('Processamento de mensagens de status iniciado'))
    .catch(err => console.error('Erro ao iniciar processamento de mensagens:', err));

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`Swagger disponível em http://localhost:${PORT}/api-docs`);
});