import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

export class SqsClient {
  private sqsClient: SQSClient;

  constructor() {
    this.sqsClient = new SQSClient({
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_SQS_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        sessionToken: process.env.AWS_SESSION_TOKEN,
      },
    });
  }

  async sendMessage(queueUrl: string, messageBody: any): Promise<string | undefined> {
    try {
      const params = {
        MessageBody: JSON.stringify(messageBody),
        QueueUrl: queueUrl,
        MessageGroupId: "soat-fiap-x-group"
      };

      const command = new SendMessageCommand(params);
      const data = await this.sqsClient.send(command);
      
      console.log(`Mensagem enviada com sucesso. ID da Mensagem: ${data.MessageId}`);
      return data.MessageId;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  async receiveMessages(queueUrl: string, maxNumberOfMessages: number = 10, waitTimeSeconds: number = 20) {
    try {
      const params = {
        QueueUrl: queueUrl,
        MaxNumberOfMessages: maxNumberOfMessages,
        WaitTimeSeconds: waitTimeSeconds,
      };

      const command = new ReceiveMessageCommand(params);
      const { Messages } = await this.sqsClient.send(command);
      
      return Messages || [];
    } catch (error) {
      console.error('Erro ao receber mensagens:', error);
      throw error;
    }
  }

  async deleteMessage(queueUrl: string, receiptHandle: string): Promise<void> {
    try {
      const deleteParams = {
        QueueUrl: queueUrl,
        ReceiptHandle: receiptHandle,
      };
      
      const deleteCommand = new DeleteMessageCommand(deleteParams);
      await this.sqsClient.send(deleteCommand);
      
      console.log('Mensagem excluída com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
      throw error;
    }
  }
}
