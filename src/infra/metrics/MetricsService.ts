import promClient from 'prom-client';

export class MetricsService {
  private static instance: MetricsService;
  
  // Métricas HTTP
  public readonly httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
  });

  public readonly httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
  });

  // Métricas de Usuários
  public readonly usersTotal = new promClient.Gauge({
    name: 'users_total',
    help: 'Total number of users in the system'
  });

  public readonly userOperationsTotal = new promClient.Counter({
    name: 'user_operations_total',
    help: 'Total number of user operations',
    labelNames: ['operation', 'status']
  });

  // Métricas de Autenticação
  public readonly authAttemptsTotal = new promClient.Counter({
    name: 'auth_attempts_total',
    help: 'Total number of authentication attempts',
    labelNames: ['status']
  });

  // Métricas de Sistema
  public readonly nodeVersion = new promClient.Gauge({
    name: 'node_version_info',
    help: 'Node.js version info',
    labelNames: ['version']
  });

  private constructor() {
    // Registrar métricas padrão do Node.js
    promClient.collectDefaultMetrics({
      register: promClient.register,
      prefix: 'nodejs_'
    });

    // Definir versão do Node.js
    this.nodeVersion.set({ version: process.version }, 1);
  }

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  public getMetrics(): Promise<string> {
    return promClient.register.metrics();
  }

  public getContentType(): string {
    return promClient.register.contentType;
  }

  // Métodos auxiliares para incrementar métricas
  public incrementHttpRequests(method: string, route: string, statusCode: number): void {
    this.httpRequestsTotal.inc({ 
      method, 
      route: route || 'unknown', 
      status_code: statusCode.toString() 
    });
  }

  public observeHttpDuration(method: string, route: string, statusCode: number, duration: number): void {
    this.httpRequestDuration.observe(
      { 
        method, 
        route: route || 'unknown', 
        status_code: statusCode.toString() 
      }, 
      duration
    );
  }

  public incrementUserOperation(operation: string, status: 'success' | 'error'): void {
    this.userOperationsTotal.inc({ operation, status });
  }

  public incrementAuthAttempt(status: 'success' | 'failed'): void {
    this.authAttemptsTotal.inc({ status });
  }

  public setUsersTotal(count: number): void {
    this.usersTotal.set(count);
  }
}