import { DefaultUploadUseCase } from "../../../../../src/application/usecase/implementations/command/DefaultUploadUseCase";
import { ProcessRepository } from "../../../../../src/application/repository/ProcessRepository";
import { FileStorageGateway } from "../../../../../src/application/gateway/FileStorageGateway";
import { UserGateway } from "../../../../../src/application/gateway/UserGateway";
import { ProcessGateway } from "../../../../../src/application/gateway/ProcessGateway";
import { Process } from "../../../../../src/domain/entity/Process";
import { DomainError } from "../../../../../src/domain/error/DomainError";

describe('DefaultUploadUseCase', () => {
  let useCase: DefaultUploadUseCase;
  let mockRepository: jest.Mocked<ProcessRepository>;
  let mockFileStorage: jest.Mocked<FileStorageGateway>;
  let mockUserGateway: jest.Mocked<UserGateway>;
  let mockProcessGateway: jest.Mocked<ProcessGateway>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      deleteById: jest.fn(),
      listByUserId: jest.fn()
    };
    mockFileStorage = {
      uploadFile: jest.fn(),
      downloadFile: jest.fn(),
      deleteFile: jest.fn()
    };
    mockUserGateway = {
      findById: jest.fn(),
      validateToken: jest.fn()
    };
    mockProcessGateway = {
      send: jest.fn()
    };
    useCase = new DefaultUploadUseCase(
      mockRepository,
      mockFileStorage,
      mockUserGateway,
      mockProcessGateway
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Deve criar processo e enviar para gateway', async () => {
    const mockFile = { originalname: 'file.mp4' } as Express.Multer.File;
    const mockUser = { id: 'user-1', name: 'Test User' };
    mockUserGateway.findById.mockResolvedValue(mockUser);
    mockFileStorage.uploadFile.mockResolvedValue('file-1');
    mockRepository.save.mockImplementation(async (p) => p);
    mockProcessGateway.send.mockResolvedValue(undefined);

    const result = await useCase.execute(mockFile);
    expect(mockUserGateway.findById).toHaveBeenCalled();
    expect(mockFileStorage.uploadFile).toHaveBeenCalledWith(mockFile);
    expect(mockRepository.save).toHaveBeenCalled();
    expect(mockProcessGateway.send).toHaveBeenCalled();
    expect(typeof result).toBe('string');
  });

  test('Deve lançar erro se usuário não encontrado', async () => {
    const mockFile = { originalname: 'file.mp4' } as Express.Multer.File;
    mockUserGateway.findById.mockResolvedValue(undefined);
    await expect(useCase.execute(mockFile)).rejects.toThrow(DomainError);
  });
});
