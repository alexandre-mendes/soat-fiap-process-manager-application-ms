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
import { metricsMiddleware } from './api/metrictsMiddleware';
import { metricsRouter } from './api/metricsRouter';

const app = express();

// Configurações para otimizar streaming de arquivos grandes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// Timeout personalizado para downloads grandes
app.use('/api/process-manager/:processId/download', (req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(300000); // 5 minutos timeout
    res.setTimeout(300000);
    next();
});

// Timeout geral para todas as rotas de API (mais conservador)
app.use('/api/*', (req: Request, res: Response, next: NextFunction) => {
    req.setTimeout(60000); // 1 minuto para outras rotas
    res.setTimeout(60000);
    next();
});

// Middleware de métricas (antes de todas as rotas)
app.use(metricsMiddleware);

//Rotas
app.use(authMiddleware);
app.use(metricsRouter);
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
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Métricas disponíveis em http://localhost:${PORT}/metrics`);
    console.log(`📋 Swagger disponível em http://localhost:${PORT}/api-docs`);
});