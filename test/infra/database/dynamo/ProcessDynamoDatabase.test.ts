import { ProcessDynamoDatabase, IProcess } from '../../../../src/infra/database/dynamo/ProcessDynamoDatabase';
import { DBOperation } from '../../../../src/infra/database/dynamo/IDatabase';

describe('ProcessDynamoDatabase', () => {
  let dynamoMock: any;
  let db: ProcessDynamoDatabase;

  beforeEach(() => {
    dynamoMock = {
      putItem: jest.fn(),
      deleteItem: jest.fn(),
      getItem: jest.fn(),
      scanByField: jest.fn()
    };
    db = new ProcessDynamoDatabase(dynamoMock);
  });

  test('save deve salvar e retornar entidade com id', async () => {
    const entity: IProcess = {
      id: '',
      user: { id: 'u1', name: 'User' },
      fileName: 'file',
      fileId: 'fid',
      createdAt: new Date().toISOString(),
      status: 'NEW'
    };
    dynamoMock.putItem.mockResolvedValue(undefined);
    const result = await db.save(entity);
    expect(dynamoMock.putItem).toHaveBeenCalledWith('process', expect.objectContaining({ user: { id: 'u1', name: 'User' } }));
    expect(result.id).toBeTruthy();
  });

  test('update deve chamar save', async () => {
    const entity: IProcess = {
      id: 'id1',
      user: { id: 'u2', name: 'User2' },
      fileName: 'file2',
      fileId: 'fid2',
      createdAt: new Date().toISOString(),
      status: 'IN_PROGRESS'
    };
    dynamoMock.putItem.mockResolvedValue(undefined);
    const result = await db.update(entity);
    expect(dynamoMock.putItem).toHaveBeenCalledWith('process', expect.objectContaining({ id: 'id1' }));
    expect(result).toEqual(entity);
  });

  test('deleteById deve chamar dynamo.deleteItem', async () => {
    dynamoMock.deleteItem.mockResolvedValue(undefined);
    await db.deleteById('del-id');
    expect(dynamoMock.deleteItem).toHaveBeenCalledWith('process', { id: 'del-id' });
  });

  test('findById deve retornar entidade correta', async () => {
    const entity: IProcess = {
      id: 'id2',
      user: { id: 'u3', name: 'User3' },
      fileName: 'file3',
      fileId: 'fid3',
      createdAt: new Date().toISOString(),
      status: 'COMPLETED'
    };
    dynamoMock.getItem.mockResolvedValue(entity);
    const result = await db.findById('id2');
    expect(dynamoMock.getItem).toHaveBeenCalledWith('process', { id: 'id2' });
    expect(result).toEqual(entity);
  });

  test('findByQuery deve retornar primeiro resultado', async () => {
    const entity: IProcess = {
      id: 'id3',
      user: { id: 'u4', name: 'User4' },
      fileName: 'file4',
      fileId: 'fid4',
      createdAt: new Date().toISOString(),
      status: 'NEW'
    };
    dynamoMock.scanByField.mockResolvedValue([entity]);
    const query = new (require('../../../../src/infra/database/dynamo/IDatabase').DBQuery)();
    const DBCriteria = require('../../../../src/infra/database/dynamo/IDatabase').DBCriteria;
    query.add(new DBCriteria('user.id', 'u4', DBOperation.EQUALS));
    const result = await db.findByQuery(query);
    expect(dynamoMock.scanByField).toHaveBeenCalled();
    expect(result).toEqual(entity);
  });

  test('findAllByQuery deve montar expressão e retornar lista', async () => {
    const entity: IProcess = {
      id: 'id4',
      user: { id: 'u5', name: 'User5' },
      fileName: 'file5',
      fileId: 'fid5',
      createdAt: new Date().toISOString(),
      status: 'NEW'
    };
    dynamoMock.scanByField.mockResolvedValue([entity]);
    const query = new (require('../../../../src/infra/database/dynamo/IDatabase').DBQuery)();
    const DBCriteria = require('../../../../src/infra/database/dynamo/IDatabase').DBCriteria;
    query.add(new DBCriteria('user.id', 'u5', DBOperation.EQUALS));
    query.add(new DBCriteria('status', 'NEW', DBOperation.EQUALS));
    const result = await db.findAllByQuery(query);
    expect(dynamoMock.scanByField).toHaveBeenCalledWith(expect.objectContaining({ tableName: 'process' }));
    expect(result).toEqual([entity]);
  });
});
