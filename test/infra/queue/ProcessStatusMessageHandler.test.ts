import { ProcessStatusMessageHandler } from '../../../src/infra/queue/ProcessStatusMessageHandler';
import { UpdateProcessStatusUseCase } from '../../../src/application/usecase/UpdateProcessStatusUseCase';
import { IMessageConsumer } from '../../../src/infra/queue/sqs';

describe('ProcessStatusMessageHandler', () => {
    let messageConsumer: jest.Mocked<IMessageConsumer>;
    let updateProcessStatusUseCase: jest.Mocked<UpdateProcessStatusUseCase>;
    let handler: ProcessStatusMessageHandler;

    beforeEach(() => {
        messageConsumer = {
            startPolling: jest.fn(),
            stopPolling: jest.fn()
        } as any;
        updateProcessStatusUseCase = {
            execute: jest.fn()
        } as any;
        const mailtrapService = { sendMail: jest.fn() } as any;
        const processRepository = { findById: jest.fn() } as any;
        handler = new ProcessStatusMessageHandler(messageConsumer, updateProcessStatusUseCase, mailtrapService, processRepository);
    });

    it('deve iniciar o processamento e chamar startPolling', async () => {
        messageConsumer.startPolling.mockResolvedValueOnce();
        await handler.startProcessing();
        expect(messageConsumer.startPolling).toHaveBeenCalled();
    });

    it('deve processar mensagem válida e chamar updateProcessStatusUseCase.execute', async () => {
        const message = { processId: '123', status: 'COMPLETED', zipKey: 'zip-1' };
        updateProcessStatusUseCase.execute.mockResolvedValueOnce();
        await handler['handleMessage'](message);
        expect(updateProcessStatusUseCase.execute).toHaveBeenCalledWith('123', 'COMPLETED', 'zip-1');
    });

    it('deve lançar erro para mensagem inválida', async () => {
        const message = { processId: '', status: '' };
        await expect(handler['handleMessage'](message)).rejects.toThrow('Mensagem inválida');
    });

});
