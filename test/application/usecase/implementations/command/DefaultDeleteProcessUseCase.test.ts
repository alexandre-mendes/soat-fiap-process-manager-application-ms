import { DefaultDeleteProcessUseCase } from "../../../../../src/application/usecase/implementations/command/DefaultDeleteProcessUseCase";
import { ProcessRepository } from "../../../../../src/application/repository/ProcessRepository";
import { FileStorageGateway } from "../../../../../src/application/gateway/FileStorageGateway";
import { Process, ProcessStatus } from "../../../../../src/domain/entity/Process";
import { DomainError } from "../../../../../src/domain/error/DomainError";


describe('DefaultDeleteProcessUseCase', () => {
    let useCase: DefaultDeleteProcessUseCase;
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
        useCase = new DefaultDeleteProcessUseCase(mockRepository, mockStorage);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Deve deletar processo COMPLETED com sucesso', async () => {
    const process = new Process({ id: 'user-1', name: 'Test User', email: 'user1@email.com' }, 'file.mp4', 'file-1');
        process.updateStatus(ProcessStatus.COMPLETED, 'zip-key-123');
        mockRepository.findById.mockResolvedValue(process);
        mockRepository.deleteById.mockResolvedValue();
        mockStorage.deleteFile.mockResolvedValue();

        const result = await useCase.execute([process.id]);
        expect(mockRepository.findById).toHaveBeenCalledWith(process.id);
        expect(mockRepository.deleteById).toHaveBeenCalledWith(process.id);
        expect(mockStorage.deleteFile).toHaveBeenCalledWith(process.zipKey);
        expect(result.deletedCount).toBe(1);
        expect(result.skippedCount).toBe(0);
        expect(result.errors.length).toBe(0);
    });

    test('Deve pular processo IN_PROGRESS', async () => {
    const process = new Process({ id: 'user-1', name: 'Test User', email: 'user1@email.com' }, 'file.mp4', 'file-1');
        process.updateStatus(ProcessStatus.IN_PROGRESS);
        mockRepository.findById.mockResolvedValue(process);

        const result = await useCase.execute([process.id]);
        expect(result.deletedCount).toBe(0);
        expect(result.skippedCount).toBe(1);
        expect(result.errors[0]).toMatch(/não pode ser deletado/);
    });

    test('Deve retornar erro se processo não existe', async () => {
        mockRepository.findById.mockResolvedValue(undefined);
        const result = await useCase.execute(['invalid-id']);
        expect(result.deletedCount).toBe(0);
        expect(result.errors[0]).toMatch(/não encontrado/);
    });

    test('Deve lançar erro se lista de IDs for vazia', async () => {
        await expect(useCase.execute([])).rejects.toThrow(DomainError);
    });
})
