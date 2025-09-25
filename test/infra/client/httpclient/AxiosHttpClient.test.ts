import { AxiosHttpClient } from '../../../../src/infra/client/httpclient/AxiosHttpClient';
import axios from 'axios';

describe('AxiosHttpClient', () => {
  let axiosMock: any;
  let client: AxiosHttpClient;

  beforeEach(() => {
    axiosMock = {
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      get: jest.fn()
    };
    jest.spyOn(axios, 'create').mockReturnValue(axiosMock);
    client = new AxiosHttpClient('http://localhost');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('post deve chamar api.post com path, body e headers', async () => {
    axiosMock.post.mockResolvedValue('post-result');
    const result = await client.post('/path', { foo: 'bar' }, { Authorization: 'token' });
    expect(axiosMock.post).toHaveBeenCalledWith('/path', { foo: 'bar' }, { headers: { Authorization: 'token' } });
    expect(result).toBe('post-result');
  });

  test('put deve chamar api.put com path, body e headers', async () => {
    axiosMock.put.mockResolvedValue('put-result');
    const result = await client.put('/path', { foo: 'bar' }, { Authorization: 'token' });
    expect(axiosMock.put).toHaveBeenCalledWith('/path', { foo: 'bar' }, { headers: { Authorization: 'token' } });
    expect(result).toBe('put-result');
  });

  test('delete deve chamar api.delete com path e headers', async () => {
    axiosMock.delete.mockResolvedValue('delete-result');
    const result = await client.delete('/path', { Authorization: 'token' });
    expect(axiosMock.delete).toHaveBeenCalledWith('/path', { headers: { Authorization: 'token' } });
    expect(result).toBe('delete-result');
  });

  test('get deve chamar api.get e retornar response.data', async () => {
    axiosMock.get.mockResolvedValue({ data: 'get-data' });
    const result = await client.get('/path', { Authorization: 'token' });
    expect(axiosMock.get).toHaveBeenCalledWith('/path', { headers: { Authorization: 'token' } });
    expect(result).toBe('get-data');
  });
});
