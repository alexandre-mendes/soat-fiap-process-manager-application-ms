import { Process, ProcessStatus } from "../../../src/domain/entity/Process";
import { DomainError } from "../../../src/domain/error/DomainError";

describe('Process Entity', () => {
  const validUser = { id: 'user-1', name: 'Test User', email: 'user1@email.com' };

  test('Deve criar processo válido', () => {
  const process = new Process({ id: 'user-1', name: 'Test User', email: 'user1@email.com' }, 'file.mp4', 'file-1');
    expect(process.id).toBeDefined();
    expect(process.user).toEqual(validUser);
    expect(process.fileName).toBe('file.mp4');
    expect(process.fileId).toBe('file-1');
    expect(process.status).toBe(ProcessStatus.PENDING);
    expect(process.createdAt).toBeInstanceOf(Date);
    expect(process.zipKey).toBeUndefined();
  });

  test('Deve lançar erro se usuário inválido', () => {
    expect(() => new Process(undefined as any, 'file.mp4', 'file-1')).toThrow(DomainError);
    expect(() => new Process({} as any, 'file.mp4', 'file-1')).toThrow(DomainError);
  });

  test('Deve lançar erro se nome do arquivo inválido', () => {
  expect(() => new Process({ id: 'user-1', name: 'Test User', email: 'user1@email.com' }, '', 'file-1')).toThrow(DomainError);
  });

  test('Deve lançar erro se fileId inválido', () => {
  expect(() => new Process({ id: 'user-1', name: 'Test User', email: 'user1@email.com' }, 'file.mp4', '')).toThrow(DomainError);
  });

  test('Deve atualizar status e zipKey corretamente', () => {
  const process = new Process({ id: 'user-1', name: 'Test User', email: 'user1@email.com' }, 'file.mp4', 'file-1');
    process.updateStatus(ProcessStatus.IN_PROGRESS);
    expect(process.status).toBe(ProcessStatus.IN_PROGRESS);
    process.updateStatus(ProcessStatus.COMPLETED, 'zip-key-123');
    expect(process.status).toBe(ProcessStatus.COMPLETED);
    expect(process.zipKey).toBe('zip-key-123');
    process.updateStatus(ProcessStatus.DOWNLOADED);
    expect(process.status).toBe(ProcessStatus.DOWNLOADED);
  });

  test('Deve lançar erro ao atualizar para status inválido', () => {
  const process = new Process({ id: 'user-1', name: 'Test User', email: 'user1@email.com' }, 'file.mp4', 'file-1');
    expect(() => process.updateStatus('INVALID' as any)).toThrow(DomainError);
  });

  test('Setters devem atualizar propriedades', () => {
  const process = new Process({ id: 'user-1', name: 'Test User', email: 'user1@email.com' }, 'file.mp4', 'file-1');
    const newId = 'new-id';
    const newDate = new Date('2023-09-25T10:00:00Z');
    process.id = newId;
    process.createdAt = newDate;
    process.status = ProcessStatus.FAILED;
    process.zipKey = 'zip-key-999';
    expect(process.id).toBe(newId);
    expect(process.createdAt).toBe(newDate);
    expect(process.status).toBe(ProcessStatus.FAILED);
    expect(process.zipKey).toBe('zip-key-999');
  });
});
