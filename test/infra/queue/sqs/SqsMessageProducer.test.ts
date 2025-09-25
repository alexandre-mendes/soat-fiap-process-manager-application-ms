import { SqsMessageProducer } from '../../../../src/infra/queue/sqs/SqsMessageProducer';
import { SQSClient, SendMessageCommand, CreateQueueCommand, GetQueueUrlCommand } from '@aws-sdk/client-sqs';

jest.mock('@aws-sdk/client-sqs');

const mockSend = jest.fn();
(SQSClient as jest.Mock).mockImplementation(() => ({ send: mockSend }));

describe('SqsMessageProducer', () => {
  const queueUrl = 'https://sqs.localhost/1234/queue-test';
  let producer: SqsMessageProducer;

  beforeEach(() => {
    jest.clearAllMocks();
    producer = new SqsMessageProducer(queueUrl);
  });

  it('deve enviar mensagem com sucesso', async () => {
    // Simula fila existente
    mockSend.mockImplementationOnce(async (cmd) => {
      if (cmd instanceof GetQueueUrlCommand) {
        return { QueueUrl: queueUrl };
      }
      throw new Error('Comando inesperado');
    });
    // Simula envio de mensagem
    mockSend.mockImplementationOnce(async (cmd) => {
      if (cmd instanceof SendMessageCommand) {
        return { MessageId: 'msg-123' };
      }
      throw new Error('Comando inesperado');
    });

    const result = await producer.send({ foo: 'bar' });
    expect(result).toBe('msg-123');
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it('deve criar fila se não existir e enviar mensagem', async () => {
    // Simula erro de fila inexistente
    mockSend.mockImplementationOnce(async (cmd) => {
      if (cmd instanceof GetQueueUrlCommand) {
        const error: any = new Error('QueueDoesNotExist');
        error.name = 'QueueDoesNotExist';
        throw error;
      }
      throw new Error('Comando inesperado');
    });
    // Simula criação da fila
    mockSend.mockImplementationOnce(async (cmd) => {
      if (cmd instanceof CreateQueueCommand) {
        return { QueueUrl: queueUrl };
      }
      throw new Error('Comando inesperado');
    });
    // Simula envio de mensagem
    mockSend.mockImplementationOnce(async (cmd) => {
      if (cmd instanceof SendMessageCommand) {
        return { MessageId: 'msg-456' };
      }
      throw new Error('Comando inesperado');
    });

    const result = await producer.send({ foo: 'bar' });
    expect(result).toBe('msg-456');
    expect(mockSend).toHaveBeenCalledTimes(3);
  });

  it('deve lançar erro ao falhar no envio', async () => {
    mockSend.mockImplementationOnce(async (cmd) => {
      if (cmd instanceof GetQueueUrlCommand) {
        return { QueueUrl: queueUrl };
      }
      throw new Error('Comando inesperado');
    });
    mockSend.mockImplementationOnce(async (cmd) => {
      if (cmd instanceof SendMessageCommand) {
        throw new Error('erro envio');
      }
      throw new Error('Comando inesperado');
    });

    await expect(producer.send({ foo: 'bar' })).rejects.toThrow('erro envio');
    expect(mockSend).toHaveBeenCalledTimes(2);
  });
});
