import { DefaultDownloadProcessZipUseCase } from "../../../../../src/application/usecase/implementations/command/DefaultDownloadProcessZipUseCase";
import { ProcessRepository } from "../../../../../src/application/repository/ProcessRepository";
import { FileStorageGateway } from "../../../../../src/application/gateway/FileStorageGateway";
import { Process } from "../../../../../src/domain/entity/Process";
import { DomainError } from "../../../../../src/domain/error/DomainError";
import { Readable } from "stream";

describe('DefaultDownloadProcessZipUseCase', () => {
  let useCase: DefaultDownloadProcessZipUseCase;
  let mockRepository: jest.Mocked<ProcessRepository>;
  let mockStorage: jest.Mocked<FileStorageGateway>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      deleteById: jest.fn(),
      listByUserId: jest.fn(),
      save: jest.fn()
    };
    mockStorage = {
      uploadFile: jest.fn(),
      downloadFile: jest.fn(),
      deleteFile: jest.fn()
    };
    useCase = new DefaultDownloadProcessZipUseCase(mockRepository, mockStorage);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Deve baixar zip de processo existente', async () => {
  const process = new Process({ id: 'user-1', name: 'Test User' }, 'file.mp4', 'file-1');
  process.zipKey = 'zip-key-123';
  process.status = 'COMPLETED';
  mockRepository.findById.mockResolvedValue(process);
  const mockStream = new Readable();
  mockStorage.downloadFile.mockResolvedValue({ stream: mockStream, contentType: 'application/zip', contentLength: 123 });

  const result = await useCase.execute(process.id);
  expect(mockRepository.findById).toHaveBeenCalledWith(process.id);
  expect(mockStorage.downloadFile).toHaveBeenCalledWith('zip-key-123');
  expect(result.fileStream).toBe(mockStream);
  expect(result.contentType).toBe('application/zip');
  expect(result.contentLength).toBe(123);
  });

  test('Deve lançar erro se processo não existe', async () => {
    mockRepository.findById.mockResolvedValue(undefined);
    await expect(useCase.execute('invalid-id')).rejects.toThrow(DomainError);
  });

  test('Deve lançar erro se zipKey não existe', async () => {
    const process = new Process({ id: 'user-1', name: 'Test User' }, 'file.mp4', 'file-1');
    mockRepository.findById.mockResolvedValue(process);
    await expect(useCase.execute(process.id)).rejects.toThrow(DomainError);
  });
});
