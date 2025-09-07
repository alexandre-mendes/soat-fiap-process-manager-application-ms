import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand, CreateQueueCommand, GetQueueUrlCommand } from '@aws-sdk/client-sqs';
import { IMessageConsumer, IPollingOptions } from './IMessageConsumer';

export class SqsMessageConsumer implements IMessageConsumer {
  private sqsClient: SQSClient;
  private queueUrl: string;
  private queueName: string;
  private isPolling: boolean = false;

  constructor(queueUrl: string) {
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_SQS_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        sessionToken: process.env.AWS_SESSION_TOKEN,
      },
    });
    this.queueUrl = queueUrl;
    // Extrai o nome da fila da URL
    this.queueName = queueUrl.split('/').pop() || 'default-queue';
  }

  private async ensureQueueExists(): Promise<string> {
    try {
      // Tenta obter a URL da fila primeiro
      const getQueueUrlCommand = new GetQueueUrlCommand({
        QueueName: this.queueName,
      });
      
      const result = await this.sqsClient.send(getQueueUrlCommand);
      return result.QueueUrl!;
    } catch (error: any) {
      if (error.name === 'QueueDoesNotExist' || error.name === 'AWS.SimpleQueueService.NonExistentQueue') {
        console.log(`Fila ${this.queueName} não existe. Criando...`);
        
        // Cria a fila se não existir
        const createQueueCommand = new CreateQueueCommand({
          QueueName: this.queueName,
          Attributes: {
            VisibilityTimeout: '30',
            MessageRetentionPeriod: '1209600', // 14 dias
          },
        });
        
        const createResult = await this.sqsClient.send(createQueueCommand);
        console.log(`Fila ${this.queueName} criada com sucesso.`);
        return createResult.QueueUrl!;
      }
      throw error;
    }
  }

  async startPolling(
    messageHandler: (message: any) => Promise<void>,
    options?: IPollingOptions
  ): Promise<void> {
    if (this.isPolling) {
      console.log('Polling já está em execução');
      return;
    }

    this.isPolling = true;
    const { maxNumberOfMessages = 10, waitTimeSeconds = 20, pollInterval = 5000 } = options || {};

    console.log('Iniciando polling de mensagens...');

    // Garante que a fila existe antes de iniciar o polling
    const queueUrl = await this.ensureQueueExists();

    while (this.isPolling) {
      try {
        const receiveCommand = new ReceiveMessageCommand({
          QueueUrl: queueUrl,
          MaxNumberOfMessages: maxNumberOfMessages,
          WaitTimeSeconds: waitTimeSeconds,
        });
        
        const { Messages } = await this.sqsClient.send(receiveCommand);
        const messages = Messages || [];

        if (messages.length > 0) {
          for (const message of messages) {
            if (message.Body) {
              try {
                const parsedMessage = JSON.parse(message.Body);
                console.log('Mensagem recebida:', parsedMessage);

                // Processa a mensagem
                await messageHandler(parsedMessage);

                // Remove a mensagem da fila após processamento bem-sucedido
                if (message.ReceiptHandle) {
                  const deleteCommand = new DeleteMessageCommand({
                    QueueUrl: queueUrl,
                    ReceiptHandle: message.ReceiptHandle,
                  });
                  await this.sqsClient.send(deleteCommand);
                  console.log(`Mensagem com ID ${message.MessageId} processada e excluída.`);
                }
              } catch (processingError) {
                console.error('Erro ao processar mensagem:', processingError);
                // Em caso de erro, a mensagem não será excluída e poderá ser reprocessada
              }
            }
          }
        } else {
          console.log('Nenhuma mensagem na fila.');
        }
      } catch (error) {
        console.error('Erro durante o polling:', error);
      }

      // Aguarda antes da próxima verificação
      if (this.isPolling) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
  }

  stopPolling(): void {
    this.isPolling = false;
    console.log('Polling interrompido.');
  }
}
