import { MetricsController } from "../../../../src/infra/api/controller/MetricsController";
import { MetricsService } from "../../../../src/infra/metrics/MetricsService";

describe('MetricsController', () => {
  let controller: MetricsController;
  let mockMetricsService: jest.Mocked<MetricsService>;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockMetricsService = {
      getMetrics: jest.fn(),
      getContentType: jest.fn()
    } as any;
    jest.spyOn(MetricsService, 'getInstance').mockReturnValue(mockMetricsService);
    controller = new MetricsController();
    mockReq = {};
    mockRes = {
      set: jest.fn(),
      end: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('Deve retornar métricas com content-type correto', async () => {
    mockMetricsService.getMetrics.mockResolvedValue('metrics-data');
    mockMetricsService.getContentType.mockReturnValue('text/plain');
    await controller.getMetrics(mockReq, mockRes);
    expect(mockMetricsService.getMetrics).toHaveBeenCalled();
    expect(mockRes.set).toHaveBeenCalledWith('Content-Type', 'text/plain');
    expect(mockRes.end).toHaveBeenCalledWith('metrics-data');
  });

  test('Deve retornar erro 500 se falhar ao buscar métricas', async () => {
    mockMetricsService.getMetrics.mockRejectedValue(new Error('fail'));
    await controller.getMetrics(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to get metrics' });
  });
});
