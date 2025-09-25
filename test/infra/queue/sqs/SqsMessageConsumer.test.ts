import { SqsMessageConsumer } from '../../../../src/infra/queue/sqs/SqsMessageConsumer';
import { ReceiveMessageCommand, DeleteMessageCommand, CreateQueueCommand, GetQueueUrlCommand } from '@aws-sdk/client-sqs';

jest.mock('@aws-sdk/client-sqs', () => {
  return {
    SQSClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
    ReceiveMessageCommand: jest.requireActual('@aws-sdk/client-sqs').ReceiveMessageCommand,
    DeleteMessageCommand: jest.requireActual('@aws-sdk/client-sqs').DeleteMessageCommand,
    CreateQueueCommand: jest.requireActual('@aws-sdk/client-sqs').CreateQueueCommand,
    GetQueueUrlCommand: jest.requireActual('@aws-sdk/client-sqs').GetQueueUrlCommand,
  };
});

describe('SqsMessageConsumer', () => {
  let consumer: SqsMessageConsumer;
  let mockSend: jest.Mock;
  const queueUrl = 'https://sqs.local/123/queue-test';

  beforeEach(() => {
    jest.clearAllMocks();
    consumer = new SqsMessageConsumer(queueUrl);
    // @ts-ignore
    mockSend = consumer['sqsClient'].send as jest.Mock;
  });

  it('deve garantir que a fila existe (já existe)', async () => {
    mockSend.mockResolvedValueOnce({ QueueUrl: queueUrl });
    const url = await consumer['ensureQueueExists']();
    expect(url).toBe(queueUrl);
    expect(mockSend).toHaveBeenCalledWith(expect.any(GetQueueUrlCommand));
  });

  it('deve criar a fila se não existir', async () => {
    mockSend
      .mockRejectedValueOnce({ name: 'QueueDoesNotExist' })
      .mockResolvedValueOnce({ QueueUrl: queueUrl });
    const url = await consumer['ensureQueueExists']();
    expect(url).toBe(queueUrl);
    expect(mockSend).toHaveBeenCalledWith(expect.any(CreateQueueCommand));
  });

  it('deve processar mensagens recebidas e excluir após sucesso', async () => {
    mockSend
      .mockResolvedValueOnce({ QueueUrl: queueUrl }) // ensureQueueExists
      .mockResolvedValueOnce({ Messages: [
        { Body: JSON.stringify({ foo: 'bar' }), ReceiptHandle: 'rh-1', MessageId: 'id-1' }
      ] }) // receive
      .mockResolvedValueOnce({}); // delete
    const handler = jest.fn().mockResolvedValueOnce(undefined);
    const pollingPromise = consumer.startPolling(handler, { pollInterval: 1 });
    // Para evitar loop infinito, interrompe polling após 1 ciclo
    setTimeout(() => consumer.stopPolling(), 10);
    await pollingPromise;
    expect(handler).toHaveBeenCalledWith({ foo: 'bar' });
    expect(mockSend).toHaveBeenCalledWith(expect.any(DeleteMessageCommand));
  });

  it('deve não excluir mensagem se handler lançar erro', async () => {
    mockSend
      .mockResolvedValueOnce({ QueueUrl: queueUrl }) // ensureQueueExists
      .mockResolvedValueOnce({ Messages: [
        { Body: JSON.stringify({ foo: 'bar' }), ReceiptHandle: 'rh-1', MessageId: 'id-1' }
      ] }); // receive
    const handler = jest.fn().mockRejectedValueOnce(new Error('erro processamento'));
    setTimeout(() => consumer.stopPolling(), 10);
    await consumer.startPolling(handler, { pollInterval: 1 });
    expect(handler).toHaveBeenCalledWith({ foo: 'bar' });
    expect(mockSend).not.toHaveBeenCalledWith(expect.any(DeleteMessageCommand));
  });

  it('deve parar polling corretamente', () => {
    consumer.stopPolling();
    expect(consumer['isPolling']).toBe(false);
  });
});
