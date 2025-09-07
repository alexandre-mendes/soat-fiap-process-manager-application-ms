import {
  CreateTableCommand,
  CreateTableCommandInput,
  DynamoDBClient,
  DynamoDBClientConfig,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  ScanCommand
} from '@aws-sdk/lib-dynamodb';

export class DynamoDb {

  private readonly ddbClient: DynamoDBClient;
  private readonly client: DynamoDBDocumentClient;

  constructor() {
    console.log(process.env.AWS_SESSION_TOKEN)
    const config: DynamoDBClientConfig ={
      region: process.env.AWS_REGION,
      endpoint: process.env.AWS_DYNAMO_ENDPOINT,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        sessionToken: process.env.AWS_SESSION_TOKEN
      },
    }

    this.ddbClient = new DynamoDBClient(config || {});
    this.client = DynamoDBDocumentClient.from(this.ddbClient);

    this.createTableIfNotExists('process').then(() => console.log('Tabela criada com sucesso.'))

  }

  async getItem<T = any>(tableName: string, key: Record<string, any>): Promise<T | undefined> {
    const result = await this.client.send(new GetCommand({ TableName: tableName, Key: key }));
    return result.Item as T | undefined;
  }

  async putItem(tableName: string, item: Record<string, any>): Promise<void> {
    await this.client.send(new PutCommand({ TableName: tableName, Item: item }));
  }

  async deleteItem(tableName: string, key: Record<string, any>): Promise<void> {
    await this.client.send(new DeleteCommand({ TableName: tableName, Key: key }));
  }

  async scanByField<T = any>(params: {
    tableName: string;
    filterExpression: string;
    expressionValues: Record<string, any>;
    expressionNames?: Record<string, string>;
  }): Promise<T[]> {
    const command = new ScanCommand({
      TableName: params.tableName,
      FilterExpression: params.filterExpression,
      ExpressionAttributeValues: params.expressionValues,
      ExpressionAttributeNames: params.expressionNames,
    });

    const result = await this.client.send(command);
    return result.Items as T[] || [];
  }

  async count(tableName: string): Promise<number | undefined> {
    const result = await this.client.send(
      new ScanCommand({
        TableName: tableName,
        Select: 'COUNT',
      })
    );
    return result.Count;
  }

  private async createTableIfNotExists(tableName: string): Promise<void> {
    if (!tableName) throw new Error('TableName é obrigatório');

    const input = {
      TableName: tableName,
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
      ],
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' },
      ],
      BillingMode: 'PAY_PER_REQUEST', // ou 'PROVISIONED' com Throughput
    }

    const existingTables = await this.ddbClient.send(new ListTablesCommand({}));
    const exists = existingTables.TableNames?.includes(tableName);

    if (exists) {
      console.log(`Tabela "${tableName}" já existe.`);
      return;
    }

    await this.ddbClient.send(new CreateTableCommand(input as CreateTableCommandInput));
    console.log(`Tabela "${tableName}" criada com sucesso.`);
  }
}
