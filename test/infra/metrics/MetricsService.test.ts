import { MetricsService } from '../../../src/infra/metrics/MetricsService';
import promClient from 'prom-client';

describe('MetricsService', () => {
  let service: MetricsService;
  let counterMock: any;
  let gaugeMock: any;
  let histogramMock: any;

  beforeEach(() => {
    counterMock = { inc: jest.fn() };
    gaugeMock = { set: jest.fn() };
    histogramMock = { observe: jest.fn() };
    jest.spyOn(promClient, 'Counter').mockImplementation(() => counterMock);
    jest.spyOn(promClient, 'Gauge').mockImplementation(() => gaugeMock);
    jest.spyOn(promClient, 'Histogram').mockImplementation(() => histogramMock);
    jest.spyOn(promClient, 'collectDefaultMetrics').mockImplementation(jest.fn());
    jest.spyOn(promClient.register, 'metrics').mockResolvedValue('metrics-data');
  jest.spyOn(promClient.register, 'contentType', 'get').mockReturnValue('text/plain; version=0.0.4; charset=utf-8');
    service = MetricsService.getInstance();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Limpa singleton para testes isolados
    (MetricsService as any).instance = undefined;
  });

  test('incrementHttpRequests deve incrementar contador', () => {
    service.incrementHttpRequests('GET', '/route', 200);
    expect(counterMock.inc).toHaveBeenCalledWith({ method: 'GET', route: '/route', status_code: '200' });
  });

  test('observeHttpDuration deve observar duração', () => {
    service.observeHttpDuration('POST', '/api', 201, 0.5);
    expect(histogramMock.observe).toHaveBeenCalledWith({ method: 'POST', route: '/api', status_code: '201' }, 0.5);
  });

  test('incrementUserOperation deve incrementar operação de usuário', () => {
    service.incrementUserOperation('create', 'success');
    expect(counterMock.inc).toHaveBeenCalledWith({ operation: 'create', status: 'success' });
  });

  test('incrementAuthAttempt deve incrementar tentativa de autenticação', () => {
    service.incrementAuthAttempt('failed');
    expect(counterMock.inc).toHaveBeenCalledWith({ status: 'failed' });
  });

  test('setUsersTotal deve setar total de usuários', () => {
    service.setUsersTotal(42);
    expect(gaugeMock.set).toHaveBeenCalledWith(42);
  });

  test('getMetrics deve retornar métricas', async () => {
    const result = await service.getMetrics();
    expect(result).toBe('metrics-data');
  });

  test('getContentType deve retornar tipo do conteúdo', () => {
  expect(service.getContentType()).toBe('text/plain; version=0.0.4; charset=utf-8');
  });
});
