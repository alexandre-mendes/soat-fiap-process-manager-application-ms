import { DefaultUserGateway } from '../../../src/infra/client/DefaultProductGateway';
import { HttpClient } from '../../../src/infra/client/httpclient/HttpClient';
import { RequestContextService } from '../../../src/infra/context/RequestContextService';

describe('DefaultUserGateway', () => {
  let httpClientMock: jest.Mocked<HttpClient>;
  let gateway: DefaultUserGateway;

  beforeEach(() => {
    httpClientMock = {
      post: jest.fn(),
      get: jest.fn(),
      // ...existing code...
    } as any;
    gateway = new DefaultUserGateway(httpClientMock);
  });

  test('validateToken deve chamar httpClient.post e retornar dados', async () => {
    const token = 'abc123';
    const expectedOutput = { valid: true };
    httpClientMock.post.mockResolvedValue({ data: expectedOutput });
    const result = await gateway.validateToken(token);
    expect(httpClientMock.post).toHaveBeenCalledWith(
      '/api/auth/validate',
      {},
      { Authorization: `Bearer ${token}` }
    );
    expect(result).toEqual(expectedOutput);
  });

  test('findById deve chamar httpClient.get com userId e token do contexto', async () => {
    const userId = 'user-1';
    const token = 'tok-xyz';
    const expectedUser = { id: userId, name: 'Alex' };
    jest.spyOn(RequestContextService, 'getUserId').mockReturnValue(userId);
    jest.spyOn(RequestContextService, 'getToken').mockReturnValue(token);
    httpClientMock.get.mockResolvedValue(expectedUser);
    const result = await gateway.findById();
    expect(httpClientMock.get).toHaveBeenCalledWith(
      `/api/users/${userId}`,
      { Authorization: `Bearer ${token}` }
    );
    expect(result).toEqual(expectedUser);
  });
});
