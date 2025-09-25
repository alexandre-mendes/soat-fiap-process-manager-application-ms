import { SQSClient, SendMessageCommand, CreateQueueCommand, GetQueueUrlCommand } from '@aws-sdk/client-sqs';
import { IMessageProducer } from './IMessageProducer';

export class SqsMessageProducer implements IMessageProducer {
  private sqsClient: SQSClient;
  private queueUrl: string;
  private queueName: string;

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

  async send(message: any): Promise<string | undefined> {
    try {
      // Garante que a fila existe
      const queueUrl = await this.ensureQueueExists();
      
      const command = new SendMessageCommand({
        MessageBody: JSON.stringify(message),
        QueueUrl: queueUrl,
        MessageGroupId: "soat-fiap-x-group"
      });

      const data = await this.sqsClient.send(command);
      console.log(`Mensagem enviada com sucesso. ID da Mensagem: ${data.MessageId}`);
      return data.MessageId;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }
}
