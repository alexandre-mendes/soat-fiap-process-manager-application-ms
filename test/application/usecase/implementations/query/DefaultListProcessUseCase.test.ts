import { DefaultListProcessUseCase } from "../../../../../src/application/usecase/implementations/query/DefaultListProcessUseCase";
import { ProcessRepository } from "../../../../../src/application/repository/ProcessRepository";
import { Process } from "../../../../../src/domain/entity/Process";

describe('DefaultListProcessUseCase', () => {
  let useCase: DefaultListProcessUseCase;
  let mockRepository: jest.Mocked<ProcessRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      deleteById: jest.fn(),
      listByUserId: jest.fn()
    };
    useCase = new DefaultListProcessUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Deve retornar lista ordenada de processos do usuário', async () => {
    const user = { id: 'user-1', name: 'Test User' };
    const process1 = new Process(user, 'file1.mp4', 'file-1');
      process1.createdAt = new Date('2023-09-25T10:00:00Z');
    const process2 = new Process(user, 'file2.mp4', 'file-2');
      process2.createdAt = new Date('2023-09-25T12:00:00Z');
    mockRepository.listByUserId.mockResolvedValue([process1, process2]);

    const result = await useCase.execute(user.id);
    expect(mockRepository.listByUserId).toHaveBeenCalledWith(user.id);
    expect(result.length).toBe(2);
    expect(result[0].fileName).toBe('file2.mp4'); // mais recente primeiro
    expect(result[1].fileName).toBe('file1.mp4');
  });

  test('Deve retornar lista vazia se não houver processos', async () => {
    mockRepository.listByUserId.mockResolvedValue([]);
    const result = await useCase.execute('user-x');
    expect(result).toEqual([]);
  });
});
