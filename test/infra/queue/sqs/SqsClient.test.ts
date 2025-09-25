import { SqsClient } from '../../../../src/infra/queue/sqs/SqsClient';
import { SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

jest.mock('@aws-sdk/client-sqs', () => {
  return {
    SQSClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
    SendMessageCommand: jest.requireActual('@aws-sdk/client-sqs').SendMessageCommand,
    ReceiveMessageCommand: jest.requireActual('@aws-sdk/client-sqs').ReceiveMessageCommand,
    DeleteMessageCommand: jest.requireActual('@aws-sdk/client-sqs').DeleteMessageCommand,
  };
});

describe('SqsClient', () => {
  let sqsClient: SqsClient;
  let mockSend: jest.Mock;

  beforeEach(() => {
    sqsClient = new SqsClient();
    // @ts-ignore
    mockSend = sqsClient['sqsClient'].send as jest.Mock;
    jest.clearAllMocks();
  });

  it('deve enviar mensagem com sucesso', async () => {
    mockSend.mockResolvedValueOnce({ MessageId: 'msg-123' });
    const result = await sqsClient.sendMessage('queue-url', { foo: 'bar' });
    expect(mockSend).toHaveBeenCalledWith(expect.any(SendMessageCommand));
    expect(result).toBe('msg-123');
  });

  it('deve lançar erro ao enviar mensagem', async () => {
    mockSend.mockRejectedValueOnce(new Error('erro envio'));
    await expect(sqsClient.sendMessage('queue-url', { foo: 'bar' })).rejects.toThrow('erro envio');
  });

  it('deve receber mensagens com sucesso', async () => {
    mockSend.mockResolvedValueOnce({ Messages: [{ message: '1' }, { message: '2' }] });
    const result = await sqsClient.receiveMessages('queue-url');
    expect(mockSend).toHaveBeenCalledWith(expect.any(ReceiveMessageCommand));
    expect(result).toEqual([{ message: '1' }, { message: '2' }]);
  });

  it('deve retornar array vazio se não houver mensagens', async () => {
    mockSend.mockResolvedValueOnce({});
    const result = await sqsClient.receiveMessages('queue-url');
    expect(result).toEqual([]);
  });

  it('deve lançar erro ao receber mensagens', async () => {
    mockSend.mockRejectedValueOnce(new Error('erro recebimento'));
    await expect(sqsClient.receiveMessages('queue-url')).rejects.toThrow('erro recebimento');
  });

  it('deve excluir mensagem com sucesso', async () => {
    mockSend.mockResolvedValueOnce({});
    await sqsClient.deleteMessage('queue-url', 'receipt-handle');
    expect(mockSend).toHaveBeenCalledWith(expect.any(DeleteMessageCommand));
  });

  it('deve lançar erro ao excluir mensagem', async () => {
    mockSend.mockRejectedValueOnce(new Error('erro exclusao'));
    await expect(sqsClient.deleteMessage('queue-url', 'receipt-handle')).rejects.toThrow('erro exclusao');
  });
});
