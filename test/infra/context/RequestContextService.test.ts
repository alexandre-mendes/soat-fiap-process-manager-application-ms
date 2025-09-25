import { RequestContextService, RequestContext } from '../../../src/infra/context/RequestContextService';

describe('RequestContextService', () => {
  test('run deve executar callback com contexto', () => {
    const context: RequestContext = { token: 'abc', userId: 'user-1' };
    let result: string | undefined;
    RequestContextService.run(context, () => {
      result = RequestContextService.getToken();
    });
    expect(result).toBe('abc');
  });

  test('getToken e getUserId retornam valores do contexto', () => {
    const context: RequestContext = { token: 'tok', userId: 'u-2' };
    let token, userId;
    RequestContextService.run(context, () => {
      token = RequestContextService.getToken();
      userId = RequestContextService.getUserId();
    });
    expect(token).toBe('tok');
    expect(userId).toBe('u-2');
  });

  test('setToken e setUserId alteram valores do contexto', () => {
    const context: RequestContext = { token: 'old', userId: 'old-id' };
    let token, userId;
    RequestContextService.run(context, () => {
      RequestContextService.setToken('new-token');
      RequestContextService.setUserId('new-id');
      token = RequestContextService.getToken();
      userId = RequestContextService.getUserId();
    });
    expect(token).toBe('new-token');
    expect(userId).toBe('new-id');
  });

  test('setToken lança erro se contexto não está ativo', () => {
    expect(() => RequestContextService.setToken('fail')).toThrow();
  });

  test('setUserId lança erro se contexto não está ativo', () => {
    expect(() => RequestContextService.setUserId('fail')).toThrow();
  });
});
