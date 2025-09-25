import { ProcessController } from "../../../../src/infra/api/controller/ProcessController";
import { UploadUseCase } from "../../../../src/application/usecase/UploadUseCase";
import { ListProcessUseCase } from "../../../../src/application/usecase/ListProcessUseCase";
import { DownloadProcessZipUseCase } from "../../../../src/application/usecase/DownloadProcessZipUseCase";
import { DeleteProcessUseCase } from "../../../../src/application/usecase/DeleteProcessUseCase";
import { FinalizeDownloadUseCase } from "../../../../src/application/usecase/implementations/command/DefaultFinalizeDownloadUseCase";
import { RequestContextService } from "../../../../src/infra/context/RequestContextService";

describe('ProcessController', () => {
  let controller: ProcessController;
  let mockUploadUseCase: jest.Mocked<UploadUseCase>;
  let mockListProcessUseCase: jest.Mocked<ListProcessUseCase>;
  let mockDownloadProcessZipUseCase: jest.Mocked<DownloadProcessZipUseCase>;
  let mockDeleteProcessUseCase: jest.Mocked<DeleteProcessUseCase>;
  let mockFinalizeDownloadUseCase: jest.Mocked<FinalizeDownloadUseCase>;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockUploadUseCase = { execute: jest.fn() } as any;
    mockListProcessUseCase = { execute: jest.fn() } as any;
    mockDownloadProcessZipUseCase = { execute: jest.fn() } as any;
    mockDeleteProcessUseCase = { execute: jest.fn() } as any;
    mockFinalizeDownloadUseCase = { execute: jest.fn() } as any;
    controller = new ProcessController(
      mockUploadUseCase,
      mockListProcessUseCase,
      mockDownloadProcessZipUseCase,
      mockDeleteProcessUseCase,
      mockFinalizeDownloadUseCase
    );
    mockReq = { file: {}, params: {}, body: {}, context: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      end: jest.fn(),
      headersSent: false
    };
    jest.spyOn(RequestContextService, 'run').mockImplementation(async (ctx, fn) => await fn());
    jest.spyOn(RequestContextService, 'getUserId').mockReturnValue('user-1');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('listProcess deve retornar processos do usuário', async () => {
    mockListProcessUseCase.execute.mockResolvedValue([
      {
        id: 'p1',
        user: { id: 'user-1', name: 'Test User' },
        fileName: 'file.mp4',
        fileId: 'file-1',
        createdAt: new Date(),
        status: 'COMPLETED',
        zipKey: 'zip-key-123'
      }
    ]);
    await controller.listProcess(mockReq, mockRes);
    expect(mockListProcessUseCase.execute).toHaveBeenCalledWith('user-1');
    expect(mockRes.json).toHaveBeenCalledWith([
      {
        id: 'p1',
        user: { id: 'user-1', name: 'Test User' },
        fileName: 'file.mp4',
        fileId: 'file-1',
        createdAt: expect.any(Date),
        status: 'COMPLETED',
        zipKey: 'zip-key-123'
      }
    ]);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test('upload deve chamar usecase e retornar usuário', async () => {
  mockUploadUseCase.execute.mockResolvedValue('user-1');
    await controller.upload(mockReq, mockRes);
    expect(mockUploadUseCase.execute).toHaveBeenCalledWith(mockReq.file);
  expect(mockRes.json).toHaveBeenCalledWith('user-1');
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  test('deleteProcesses deve retornar sucesso', async () => {
    mockReq.body.processIds = ['p1', 'p2'];
  mockDeleteProcessUseCase.execute.mockResolvedValue({ errors: [], deletedCount: 2, skippedCount: 0 });
    await controller.deleteProcesses(mockReq, mockRes);
    expect(mockDeleteProcessUseCase.execute).toHaveBeenCalledWith(['p1', 'p2']);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Exclusão concluída com sucesso',
      errors: [], deletedCount: 2, skippedCount: 0
    });
  });

  test('deleteProcesses deve retornar erro 400 se processIds inválido', async () => {
    mockReq.body.processIds = undefined;
    await controller.deleteProcesses(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Campo processIds é obrigatório e deve ser um array não vazio'
    });
  });

  test('deleteProcesses deve retornar erro 207 se houver erros', async () => {
    mockReq.body.processIds = ['p1'];
  mockDeleteProcessUseCase.execute.mockResolvedValue({ errors: ['erro'], deletedCount: 0, skippedCount: 1 });
    await controller.deleteProcesses(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(207);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Exclusão parcialmente concluída',
      errors: ['erro'], deletedCount: 0, skippedCount: 1
    });
  });
});
