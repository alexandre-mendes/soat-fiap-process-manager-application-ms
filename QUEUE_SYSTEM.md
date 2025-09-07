# Sistema de Atualização de Status via Filas

Este sistema implementa uma arquitetura orientada por eventos usando Amazon SQS para processar atualizações de status de processos de forma assíncrona.

## Arquitetura

### Componentes Principais

1. **UpdateProcessStatusUseCase** - Use case que atualiza o status de um processo
2. **ProcessStatusMessageHandler** - Handler que consome mensagens da fila e executa o use case
3. **SqsMessageProducer/Consumer** - Abstrações para produção e consumo de mensagens SQS
4. **Queue como Porta de Entrada** - A fila SQS serve como ponto de entrada para execução de use cases

### Fluxo de Funcionamento

```
[Sistema Externo] → [SQS Queue] → [Message Handler] → [Use Case] → [Repository] → [Database]
```

## Como Usar

### 1. Inicialização Automática

O sistema é iniciado automaticamente quando a aplicação sobe:

```typescript
// No main.ts, o processamento é iniciado automaticamente
processStatusMessageHandler.startProcessing()
    .then(() => console.log('Processamento de mensagens de status iniciado'))
    .catch(err => console.error('Erro ao iniciar processamento de mensagens:', err));
```

### 2. Enviando Mensagens para a Fila

#### Via API REST (Para Testes)

```bash
POST http://localhost:3000/test/send-status
Content-Type: application/json

{
  "processId": "process-123",
  "status": "IN_PROGRESS"
}
```

#### Via Swagger UI

Acesse `http://localhost:3000/api-docs` e use o endpoint `/test/send-status`

#### Programaticamente

```typescript
import { IMessageProducer, SqsMessageProducer } from './infra/queue/sqs';

const messageProducer: IMessageProducer = new SqsMessageProducer('process-status-queue');

await messageProducer.send({
    processId: 'process-123',
    status: 'COMPLETED'
});
```

### 3. Status Válidos

- `PENDING` - Processo pendente
- `IN_PROGRESS` - Processo em andamento  
- `COMPLETED` - Processo finalizado com sucesso
- `FAILED` - Processo falhou

### 4. Formato da Mensagem

```json
{
  "processId": "string",
  "status": "PENDING|IN_PROGRESS|COMPLETED|FAILED"
}
```

## Configuração

### Variáveis de Ambiente

```bash
# LocalStack/SQS Configuration
AWS_SQS_QUEUE_URL=http://localhost:4566/000000000000/process-status-queue
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_DEFAULT_REGION=us-east-1
AWS_ENDPOINT_URL=http://localhost:4566
```

### Configuração do LocalStack

```bash
# Iniciar LocalStack
docker run -d \
  -p 4566:4566 \
  -e SERVICES=sqs,s3,dynamodb \
  -e DEBUG=1 \
  localstack/localstack
```

## Monitoramento

### Logs

O sistema gera logs detalhados:

```
[INFO] Iniciando processamento de mensagens de status de processo...
[INFO] Processando mensagem: {"processId": "process-123", "status": "IN_PROGRESS"}
[INFO] Atualizando processo process-123: PENDING -> IN_PROGRESS
[INFO] Status do processo process-123 atualizado para IN_PROGRESS com sucesso
[INFO] Mensagem processada com sucesso - processId: process-123, status: IN_PROGRESS
```

### Verificação via API

```bash
# Listar todos os processos e verificar os status
GET http://localhost:3000/process
```

## Tratamento de Erros

### Erros de Validação

- Processo não encontrado
- Status inválido
- Dados de mensagem incompletos

### Erros de Infraestrutura

- Fila SQS indisponível
- Erro de conexão com DynamoDB
- Falha na serialização/deserialização

### Retry e Dead Letter Queue

O sistema implementa retry automático via SQS. Mensagens que falham são reprocessadas até o limite configurado.

## Desenvolvimento

### Testando o Sistema

1. **Criar um processo via upload de vídeo**:
   ```bash
   POST /process/upload
   # Isso criará um processo com status PENDING
   ```

2. **Enviar mensagem para atualizar status**:
   ```bash
   POST /test/send-status
   {
     "processId": "id-do-processo-criado",
     "status": "IN_PROGRESS"
   }
   ```

3. **Verificar a atualização**:
   ```bash
   GET /process
   # Verificar se o status foi atualizado
   ```

### Extendendo o Sistema

Para adicionar novos tipos de mensagens:

1. **Criar novo UseCase**
2. **Criar novo MessageHandler** 
3. **Configurar no DI container**
4. **Registrar no main.ts**

### Exemplo de Extensão

```typescript
// Novo use case para notificação
export class NotifyProcessCompletionUseCase {
    async execute(processId: string): Promise<void> {
        // Lógica de notificação
    }
}

// Novo handler para notificações
export class NotificationMessageHandler {
    constructor(
        private consumer: IMessageConsumer,
        private useCase: NotifyProcessCompletionUseCase
    ) {}
    
    async startProcessing(): Promise<void> {
        await this.consumer.startPolling(async (message) => {
            const { processId } = JSON.parse(message.Body);
            await this.useCase.execute(processId);
        });
    }
}
```

## Vantagens da Arquitetura

1. **Desacoplamento** - Sistemas externos não precisam conhecer a implementação interna
2. **Escalabilidade** - Múltiplos consumers podem processar mensagens em paralelo
3. **Resiliência** - Mensagens não são perdidas em caso de falha
4. **Auditoria** - Todas as mudanças de status são rastreáveis via logs
5. **Testabilidade** - Fácil de testar com LocalStack
6. **Clean Architecture** - Use cases são independentes da infraestrutura
