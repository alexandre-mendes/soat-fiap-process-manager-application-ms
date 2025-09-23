import { Request, Response } from 'express';
import { MetricsService } from '../../metrics/MetricsService';

export class MetricsController {
  private metricsService = MetricsService.getInstance();

  async getMetrics(req: Request, res: Response) {
    try {
      const metrics = await this.metricsService.getMetrics();
      res.set('Content-Type', this.metricsService.getContentType());
      res.end(metrics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get metrics' });
    }
  }
}