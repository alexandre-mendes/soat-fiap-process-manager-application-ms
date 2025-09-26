import { DefaultUpdateProcessStatusUseCase } from "../../../../../src/application/usecase/implementations/command/DefaultUpdateProcessStatusUseCase";
import { ProcessRepository } from "../../../../../src/application/repository/ProcessRepository";
import { Process, ProcessStatus } from "../../../../../src/domain/entity/Process";

describe('DefaultUpdateProcessStatusUseCase', () => {
  let useCase: DefaultUpdateProcessStatusUseCase;
  let mockRepository: jest.Mocked<ProcessRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      deleteById: jest.fn(),
      listByUserId: jest.fn()
    };
    useCase = new DefaultUpdateProcessStatusUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Deve atualizar status do processo', async () => {
  const process = new Process({ id: 'user-1', name: 'Test User', email: 'user1@email.com' }, 'file.mp4', 'file-1');
    process.status = ProcessStatus.IN_PROGRESS;
    mockRepository.findById.mockResolvedValue(process);
    mockRepository.save.mockResolvedValue(process);

    await useCase.execute(process.id, ProcessStatus.COMPLETED);
    expect(process.status).toBe(ProcessStatus.COMPLETED);
    expect(mockRepository.save).toHaveBeenCalledWith(process);
  });

  test('Deve atualizar status e zipKey', async () => {
  const process = new Process({ id: 'user-2', name: 'Test User', email: 'user2@email.com' }, 'file.mp4', 'file-2');
    process.status = ProcessStatus.IN_PROGRESS;
    mockRepository.findById.mockResolvedValue(process);
    mockRepository.save.mockResolvedValue(process);

    await useCase.execute(process.id, ProcessStatus.COMPLETED, 'zip-key-123');
    expect(process.status).toBe(ProcessStatus.COMPLETED);
    expect(process.zipKey).toBe('zip-key-123');
    expect(mockRepository.save).toHaveBeenCalledWith(process);
  });

  test('Deve não fazer nada se processo não existe', async () => {
    mockRepository.findById.mockResolvedValue(undefined);
    await useCase.execute('invalid-id', ProcessStatus.COMPLETED);
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
