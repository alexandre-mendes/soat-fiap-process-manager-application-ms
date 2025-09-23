import { Router } from 'express';
import { metricsController } from '../config/di-config';

const metricsRouter = Router();


metricsRouter.get('/metrics', metricsController.getMetrics.bind(metricsController));

export { metricsRouter };