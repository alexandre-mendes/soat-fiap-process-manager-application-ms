import { DefaultProcessRepository } from '../../../src/infra/database/DefaultProcessRepository';
import { Process } from '../../../src/domain/entity/Process';

describe('DefaultProcessRepository', () => {
  let dbMock: any;
  let repo: DefaultProcessRepository;

  beforeEach(() => {
    dbMock = {
      findAllByQuery: jest.fn(),
      save: jest.fn(),
      findByQuery: jest.fn(),
      deleteById: jest.fn()
    };
    repo = new DefaultProcessRepository(dbMock);
  });

  test('listByUserId deve buscar processos e converter para entidade', async () => {
    const dbProcess = { id: '1', user: { id: 'u1' }, fileName: 'f', fileId: 'fid', createdAt: new Date().toISOString(), status: 'NEW', zipKey: 'zip' };
    dbMock.findAllByQuery.mockResolvedValue([dbProcess]);
    const result = await repo.listByUserId('u1');
    expect(dbMock.findAllByQuery).toHaveBeenCalled();
    expect(result[0]).toBeInstanceOf(Process);
    expect(result[0].id).toBe('1');
  });

  test('save deve salvar e retornar entidade convertida', async () => {
    const entity = new Process({ id: 'u2', name: 'Test User' }, 'file', 'fid');
    entity.id = '2';
    entity.createdAt = new Date();
    entity.status = 'NEW';
    entity.zipKey = 'zip';
    dbMock.save.mockResolvedValue({ id: '2', user: { id: 'u2' }, fileName: 'file', fileId: 'fid', createdAt: entity.createdAt.toISOString(), status: 'NEW', zipKey: 'zip' });
    const result = await repo.save(entity);
    expect(dbMock.save).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Process);
    expect(result.id).toBe('2');
  });

  test('findById deve buscar e converter para entidade', async () => {
    const dbProcess = { id: '3', user: { id: 'u3' }, fileName: 'f3', fileId: 'fid3', createdAt: new Date().toISOString(), status: 'NEW', zipKey: 'zip3' };
    dbMock.findByQuery.mockResolvedValue(dbProcess);
    const result = await repo.findById('3');
    expect(dbMock.findByQuery).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Process);
    expect(result?.id).toBe('3');
  });

  test('findById deve retornar undefined se não encontrar', async () => {
    dbMock.findByQuery.mockResolvedValue(undefined);
    const result = await repo.findById('notfound');
    expect(result).toBeUndefined();
  });

  test('deleteById deve chamar database.deleteById', async () => {
    dbMock.deleteById.mockResolvedValue(undefined);
    await repo.deleteById('del-id');
    expect(dbMock.deleteById).toHaveBeenCalledWith('del-id');
  });
});
