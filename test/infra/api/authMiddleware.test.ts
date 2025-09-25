import { authMiddleware } from "../../../src/infra/api/authMiddleware";
import { validateTokenUseCase } from "../../../src/infra/config/di-config";

jest.mock("../../../src/infra/config/di-config", () => ({
  validateTokenUseCase: { execute: jest.fn() }
}));

describe('authMiddleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = { path: '/api', headers: {}, context: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  test('deve permitir rotas públicas', async () => {
    for (const path of ['/health', '/api-docs', '/metrics']) {
      mockReq.path = path;
      await authMiddleware(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    }
  });

  test('deve retornar 401 se token não informado', async () => {
    mockReq.headers = {};
    await authMiddleware(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Token não informado' });
  });

  test('deve retornar 401 se token inválido', async () => {
    mockReq.headers = { authorization: 'Bearer token' };
    (validateTokenUseCase.execute as jest.Mock).mockResolvedValue({ valid: false });
    await authMiddleware(mockReq, mockRes, mockNext);
    expect(validateTokenUseCase.execute).toHaveBeenCalledWith('token');
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Token inválido' });
  });

  test('deve adicionar contexto e chamar next se token válido', async () => {
    mockReq.headers = { authorization: 'Bearer token' };
    (validateTokenUseCase.execute as jest.Mock).mockResolvedValue({ valid: true, decoded: { sub: 'user-1' } });
    await authMiddleware(mockReq, mockRes, mockNext);
    expect(validateTokenUseCase.execute).toHaveBeenCalledWith('token');
    expect(mockReq.context).toEqual({ userId: 'user-1', token: 'token' });
    expect(mockNext).toHaveBeenCalled();
  });
});
