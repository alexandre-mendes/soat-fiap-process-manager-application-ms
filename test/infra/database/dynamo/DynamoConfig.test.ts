import { DynamoDb } from '../../../../src/infra/database/dynamo/DynamoConfig';
import { DynamoDBClient, ListTablesCommand, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

describe('DynamoDb', () => {
  let ddbClientMock: any;
  let docClientMock: any;
  let instance: DynamoDb;

  beforeEach(() => {
    ddbClientMock = {
      send: jest.fn().mockResolvedValue({ TableNames: [] })
    };
    docClientMock = {
      send: jest.fn()
    };
  jest.spyOn(DynamoDBClient.prototype, 'send').mockImplementation(ddbClientMock.send);
  jest.spyOn(DynamoDBDocumentClient, 'from').mockReturnValue(docClientMock);
  instance = new DynamoDb();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getItem deve retornar o item correto', async () => {
    jest.spyOn(instance as any, 'createTableIfNotExists').mockImplementation(async () => {});
    docClientMock.send.mockResolvedValue({ Item: { id: '1', name: 'Test' } });
    const result = await instance.getItem('table', { id: '1' });
    expect(docClientMock.send).toHaveBeenCalledWith(expect.any(GetCommand));
    expect(result).toEqual({ id: '1', name: 'Test' });
  });

  test('putItem deve enviar o comando correto', async () => {
    jest.spyOn(instance as any, 'createTableIfNotExists').mockImplementation(async () => {});
    docClientMock.send.mockResolvedValue({});
    await instance.putItem('table', { id: '2', name: 'Put' });
    expect(docClientMock.send).toHaveBeenCalledWith(expect.any(PutCommand));
  });

  test('deleteItem deve enviar o comando correto', async () => {
    jest.spyOn(instance as any, 'createTableIfNotExists').mockImplementation(async () => {});
    docClientMock.send.mockResolvedValue({});
    await instance.deleteItem('table', { id: '3' });
    expect(docClientMock.send).toHaveBeenCalledWith(expect.any(DeleteCommand));
  });

  test('scanByField deve retornar lista de itens', async () => {
    jest.spyOn(instance as any, 'createTableIfNotExists').mockImplementation(async () => {});
    docClientMock.send.mockResolvedValue({ Items: [{ id: '4' }, { id: '5' }] });
    const result = await instance.scanByField({
      tableName: 'table',
      filterExpression: 'id = :id',
      expressionValues: { ':id': '4' }
    });
    expect(docClientMock.send).toHaveBeenCalledWith(expect.any(ScanCommand));
    expect(result).toEqual([{ id: '4' }, { id: '5' }]);
  });

  test('count deve retornar o número de itens', async () => {
    jest.spyOn(instance as any, 'createTableIfNotExists').mockImplementation(async () => {});
    docClientMock.send.mockResolvedValue({ Count: 42 });
    const result = await instance.count('table');
    expect(docClientMock.send).toHaveBeenCalledWith(expect.any(ScanCommand));
    expect(result).toBe(42);
  });

  test('createTableIfNotExists não cria tabela se já existir', async () => {
  ddbClientMock.send.mockClear();
    const isolated = Object.create(DynamoDb.prototype);
    isolated.ddbClient = ddbClientMock;
    ddbClientMock.send
      .mockResolvedValueOnce({ TableNames: ['process'] }) // ListTablesCommand
      .mockResolvedValue({}); // Outras chamadas
    await isolated.createTableIfNotExists('process');
    expect(ddbClientMock.send).toHaveBeenCalledWith(expect.any(ListTablesCommand));
    expect(ddbClientMock.send).not.toHaveBeenCalledWith(expect.any(CreateTableCommand));
  });

  test('createTableIfNotExists cria tabela se não existir', async () => {
  ddbClientMock.send.mockClear();
  const isolated = Object.create(DynamoDb.prototype);
  isolated.ddbClient = ddbClientMock;
  ddbClientMock.send.mockResolvedValueOnce({ TableNames: [] });
  ddbClientMock.send.mockResolvedValueOnce({});
  await isolated.createTableIfNotExists('newtable');
  expect(ddbClientMock.send).toHaveBeenCalledWith(expect.any(ListTablesCommand));
  expect(ddbClientMock.send).toHaveBeenCalledWith(expect.any(CreateTableCommand));
  });
});
