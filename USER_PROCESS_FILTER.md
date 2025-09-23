# Filtro de Processos por Usuário

A listagem de processos foi atualizada para exibir apenas os processos que pertencem ao usuário autenticado.

## Mudanças Implementadas

### 1. Interface do Use Case
```typescript
// Antes
execute(): Promise<ProcessOutput[]>

// Depois  
execute(userId: string): Promise<ProcessOutput[]>
```

### 2. Repositório
Adicionado novo método `listByUserId`:
```typescript
async listByUserId(userId: string): Promise<Process[]> {
    const query = new DBQuery();
    query.add(new DBCriteria('user.id', userId, DBOperation.EQUALS));
    query.orderBy('createdAt', 'desc');
    const process = await this.database.findAllByQuery(query);
    return process.map(this.parseToEntity);
}
```

### 3. Controller
Agora extrai o `userId` do contexto JWT:
```typescript
async listProcess(req: Request, res: Response) {
    const userId = RequestContextService.getUserId();
    
    if (!userId) {
        return res.status(401).json({ message: 'Usuário não identificado' });
    }
    
    const processes = await this.listProcessUseCase.execute(userId);
    return res.json(processes).status(200);
}
```

## Comportamento

### Antes
- ✅ `GET /api/process-manager` retornava **todos** os processos do sistema
- ❌ Usuários viam processos de outros usuários
- ❌ Possível vazamento de dados sensíveis

### Depois
- ✅ `GET /api/process-manager` retorna **apenas** processos do usuário logado
- ✅ Isolamento completo por usuário
- ✅ Segurança de dados garantida
- ✅ Ordenação por data (mais recentes primeiro)

## Fluxo de Autenticação

1. **JWT Middleware** extrai `userId` do token
2. **RequestContext** armazena o `userId`
3. **Controller** obtém `userId` do contexto
4. **Use Case** filtra processos por `userId`
5. **Repository** executa query com filtro `user.id = userId`

## Exemplo de Query DynamoDB

```javascript
// Query executada no DynamoDB
{
  FilterExpression: "#user.#id = :userId",
  ExpressionAttributeNames: {
    "#user": "user",
    "#id": "id"
  },
  ExpressionAttributeValues: {
    ":userId": "user-123"
  },
  ScanIndexForward: false // Para ordenação decrescente
}
```

## Segurança

### Validações
- ✅ **Token JWT obrigatório**: Endpoint protegido por autenticação
- ✅ **UserId validado**: Se não houver userId no contexto, retorna 401
- ✅ **Isolamento de dados**: Cada usuário vê apenas seus próprios processos

### Casos de Erro
```json
// Token inválido ou ausente
{
  "status": 401,
  "message": "Token não fornecido ou inválido"
}

// Token válido mas userId não extraído
{
  "status": 401, 
  "message": "Usuário não identificado"
}
```

## Impacto nos Endpoints

### ✅ Alterados (filtram por usuário)
- `GET /api/process-manager` - Lista apenas processos do usuário

### ℹ️ Não alterados (já filtram naturalmente)
- `POST /api/process-manager/upload` - Cria processo para o usuário logado
- `GET /api/process-manager/{processId}/download` - Valida se processo pertence ao usuário
- `DELETE /api/process-manager` - Pode incluir validação adicional se necessário

## Swagger Atualizado

```yaml
get:
  summary: Lista processos do usuário logado
  description: Retorna todos os processos que pertencem ao usuário autenticado
```

## Testes Recomendados

### Cenários de Teste
1. **Usuário A** faz upload de arquivo → processo criado
2. **Usuário B** faz upload de arquivo → processo criado  
3. **Usuário A** lista processos → vê apenas seu processo
4. **Usuário B** lista processos → vê apenas seu processo
5. **Token inválido** → retorna erro 401

### Exemplo de Teste
```bash
# Login como usuário A
TOKEN_A="Bearer eyJ..."

# Upload como usuário A  
curl -X POST /api/process-manager/upload \
     -H "Authorization: $TOKEN_A" \
     -F "video=@video.mp4"

# Listar como usuário A (deve ver apenas seus processos)
curl -X GET /api/process-manager \
     -H "Authorization: $TOKEN_A"
```