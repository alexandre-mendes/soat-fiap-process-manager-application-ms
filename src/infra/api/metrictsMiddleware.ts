import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../metrics/MetricsService';

const metricsService = MetricsService.getInstance();

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  // Capturar quando a resposta terminar
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Converter para segundos
    const route = req.route?.path || req.path;
    
    // Incrementar contador de requests
    metricsService.incrementHttpRequests(req.method, route, res.statusCode);
    
    // Observar duração da requisição
    metricsService.observeHttpDuration(req.method, route, res.statusCode, duration);
  });

  next();
}