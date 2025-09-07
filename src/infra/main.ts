import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from "cors";
import swaggerRouter from './api/swagger';
import { NextFunction, Request, Response } from 'express';
import { DomainError } from '../domain/error/DomainError';
import healthRouter from './api/healthRouter';
import processRouter from './api/processRouter';
import { processStatusMessageHandler } from './config/di-config';
import { authMiddleware } from './api/authMiddleware';

const app = express();
app.use(express.json());
app.use(cors());

app.use(authMiddleware)
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