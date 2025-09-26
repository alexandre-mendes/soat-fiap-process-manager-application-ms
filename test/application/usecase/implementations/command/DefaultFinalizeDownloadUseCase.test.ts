import { DefaultFinalizeDownloadUseCase } from "../../../../../src/application/usecase/implementations/command/DefaultFinalizeDownloadUseCase";
import { ProcessRepository } from "../../../../../src/application/repository/ProcessRepository";
import { FileStorageGateway } from "../../../../../src/application/gateway/FileStorageGateway";
import { Process, ProcessStatus } from "../../../../../src/domain/entity/Process";
import { DomainError } from "../../../../../src/domain/error/DomainError";

describe('DefaultFinalizeDownloadUseCase', () => {
  let useCase: DefaultFinalizeDownloadUseCase;
  let mockRepository: jest.Mocked<ProcessRepository>;
  let mockStorage: jest.Mocked<FileStorageGateway>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      deleteById: jest.fn(),
      listByUserId: jest.fn()
    };
    mockStorage = {
      uploadFile: jest.fn(),
      downloadFile: jest.fn(),
      deleteFile: jest.fn()
    };
    useCase = new DefaultFinalizeDownloadUseCase(mockRepository, mockStorage);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Deve finalizar download e deletar arquivo do S3', async () => {
  const process = new Process({ id: 'user-1', name: 'Test User', email: 'user1@email.com' }, 'file.mp4', 'file-1');
    process.zipKey = 'zip-key-123';
    process.status = ProcessStatus.COMPLETED;
    mockRepository.findById.mockResolvedValue(process);
  mockRepository.save.mockResolvedValue(process);
    mockStorage.deleteFile.mockResolvedValue(undefined);

    await useCase.execute(process.id);
    expect(process.status).toBe(ProcessStatus.DOWNLOADED);
    expect(mockRepository.save).toHaveBeenCalledWith(process);
    expect(mockStorage.deleteFile).toHaveBeenCalledWith('zip-key-123');
  });

  test('Deve pular limpeza se zipKey não existe', async () => {
  const process = new Process({ id: 'user-2', name: 'Test User', email: 'user2@email.com' }, 'file.mp4', 'file-2');
    process.zipKey = undefined;
    mockRepository.findById.mockResolvedValue(process);

    await useCase.execute(process.id);
    expect(mockRepository.save).not.toHaveBeenCalled();
    expect(mockStorage.deleteFile).not.toHaveBeenCalled();
  });

  test('Deve lançar erro se processo não existe', async () => {
    mockRepository.findById.mockResolvedValue(undefined);
    await expect(useCase.execute('invalid-id')).rejects.toThrow(DomainError);
  });

  test('Deve lançar erro se falhar ao salvar ou deletar', async () => {
  const process = new Process({ id: 'user-3', name: 'Test User', email: 'user3@email.com' }, 'file.mp4', 'file-3');
    process.zipKey = 'zip-key-err';
    process.status = ProcessStatus.COMPLETED;
    mockRepository.findById.mockResolvedValue(process);
    mockRepository.save.mockRejectedValue(new Error('Falha ao salvar'));

    await expect(useCase.execute(process.id)).rejects.toThrow(DomainError);

  mockRepository.save.mockResolvedValue(process);
    mockStorage.deleteFile.mockRejectedValue(new Error('Falha ao deletar'));

    await expect(useCase.execute(process.id)).rejects.toThrow(DomainError);
  });
});
