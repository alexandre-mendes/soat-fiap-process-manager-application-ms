import { errorHandler, Execution } from '../../../src/infra/api/errorHandler';
import { Request, Response, NextFunction } from 'express';

describe('errorHandler', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  test('deve chamar execution e não acionar next em caso de sucesso', async () => {
    const execution: Execution = jest.fn().mockResolvedValue(undefined);
    const handler = errorHandler(execution);
    await handler(req as Request, res as Response, next as NextFunction);
    expect(execution).toHaveBeenCalledWith(req, res);
    expect(next).not.toHaveBeenCalled();
  });

  test('deve acionar next com erro em caso de exceção', async () => {
    const error = new Error('Erro de teste');
    const execution: Execution = jest.fn().mockRejectedValue(error);
    const handler = errorHandler(execution);
    await handler(req as Request, res as Response, next as NextFunction);
    expect(execution).toHaveBeenCalledWith(req, res);
    expect(next).toHaveBeenCalledWith(error);
  });
});
