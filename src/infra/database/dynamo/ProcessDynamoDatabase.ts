import { DBOperation, DBQuery, Filter, IDatabase } from "./IDatabase";
import { DynamoDb } from "./DynamoConfig";

export interface IProcess {
    id: string;
    user: { id: string; name: string };
    fileName: string;
    fileId: string;
    createdAt: string;
    status: string;
    zipKey?: string;
}

export class ProcessDynamoDatabase implements IDatabase<IProcess> {

  constructor(private dynamo: DynamoDb) { }

  async save(entity: IProcess): Promise<IProcess> {
    if (!entity.id)
      entity.id = crypto.randomUUID();

    await this.dynamo.putItem('process', entity);
    return entity;
  }

  async update(entity: IProcess): Promise<IProcess> {
    return await this.save(entity);
  }

  async deleteById(id: string): Promise<void> {
    await this.dynamo.deleteItem('process', { id })
  }

  async findById(id: string): Promise<IProcess | null> {
    return await this.dynamo.getItem('process', { id }) as IProcess;
  }

  async findByQuery(query: DBQuery): Promise<IProcess> {
    const results = await this.findAllByQuery(query);
    return results[0] ?? null;
  }

  async findAllByQuery(query: DBQuery): Promise<IProcess[]> {
    const expressionParts: string[] = [];
    const expressionValues: Record<string, any> = {};
    const expressionNames: Record<string, string> = {};

    query.andCriteria.forEach((criteria, i) => {
      const valuePlaceholder = `:v${i}`;
      
      // Tratamento especial para campos aninhados como 'user.id'
      let keyExpression: string;
      if (criteria.key.includes('.')) {
        const keyParts = criteria.key.split('.');
        const aliasKeys = keyParts.map((part, partIndex) => {
          const alias = `#k${i}_${partIndex}`;
          expressionNames[alias] = part;
          return alias;
        });
        keyExpression = aliasKeys.join('.');
      } else {
        const keyAlias = `#k${i}`;
        expressionNames[keyAlias] = criteria.key;
        keyExpression = keyAlias;
      }

      expressionValues[valuePlaceholder] = criteria.value;

      switch (criteria.operation) {
        case DBOperation.EQUALS:
          expressionParts.push(`${keyExpression} = ${valuePlaceholder}`);
          break;
        case DBOperation.NOT_EQUALS:
          expressionParts.push(`${keyExpression} <> ${valuePlaceholder}`);
          break;
        default:
          throw new Error(`Operação não suportada: ${criteria.operation}`);
      }
    });

    const filterExpression = expressionParts.join(' AND ');

    const result = await this.dynamo.scanByField<IProcess>({
      tableName: 'process',
      filterExpression,
      expressionValues,
      expressionNames,
    });

    return result;
  }

}
