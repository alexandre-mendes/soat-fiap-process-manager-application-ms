# Endpoint de Exclusão de Processos

Este endpoint permite deletar um ou mais processos com validações de segurança.

## Endpoint

```
DELETE /api/process-manager
```

## Validações de Segurança

- ✅ **Processos PENDING**: Podem ser deletados
- ✅ **Processos COMPLETED**: Podem ser deletados (arquivo ZIP também é removido do S3)
- ✅ **Processos DOWNLOADED**: Podem ser deletados
- ✅ **Processos FAILED**: Podem ser deletados
- ❌ **Processos IN_PROGRESS**: **NÃO** podem ser deletados (pulados automaticamente)

## Payload

```json
{
  "processIds": ["process-id-1", "process-id-2", "process-id-3"]
}
```

## Respostas

### Sucesso Total (200)
```json
{
  "message": "Exclusão concluída com sucesso",
  "deletedCount": 3,
  "skippedCount": 0,
  "errors": []
}
```

### Sucesso Parcial (207)
```json
{
  "message": "Exclusão parcialmente concluída",
  "deletedCount": 2,
  "skippedCount": 1,
  "errors": [
    "Processo process-id-2 não pode ser deletado - está em andamento"
  ]
}
```

### Erro (400)
```json
{
  "message": "Campo processIds é obrigatório e deve ser um array não vazio"
}
```

## Exemplos de Uso

### cURL
```bash
curl -X DELETE "http://localhost:3000/api/process-manager" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer seu-token" \
     -d '{
       "processIds": ["123e4567-e89b-12d3-a456-426614174000", "456e7890-e12b-34d5-a678-901234567890"]
     }'
```

### JavaScript (Fetch API)
```javascript
const response = await fetch('/api/process-manager', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer seu-token'
  },
  body: JSON.stringify({
    processIds: ['process-id-1', 'process-id-2']
  })
});

const result = await response.json();
console.log(`Deletados: ${result.deletedCount}, Pulados: ${result.skippedCount}`);
```

## Comportamento Detalhado

### Limpeza Automática
- **Arquivos ZIP**: Automaticamente deletados do S3 para processos `COMPLETED`
- **Logs**: Detalhados para auditoria e troubleshooting
- **Transações**: Cada processo é tratado independentemente

### Tratamento de Erros
- **Falha Individual**: Não impede a exclusão de outros processos
- **Arquivo S3**: Se falhar ao deletar do S3, processo ainda é removido do banco
- **Processo Inexistente**: Registrado como erro, mas não falha a operação

### Status HTTP
- **200**: Todos os processos foram deletados com sucesso
- **207**: Alguns processos foram deletados, outros pulados/falharam
- **400**: Erro de validação do payload

## Casos de Uso

### Limpeza em Massa
```bash
# Deletar todos os processos concluídos
DELETE /api/process-manager
{
  "processIds": ["id1", "id2", "id3", ...]
}
```

### Exclusão Seletiva
```bash
# Deletar processo específico
DELETE /api/process-manager
{
  "processIds": ["specific-process-id"]
}
```

### Administração
- Limpeza de processos antigos
- Remoção de processos falhados
- Gerenciamento de espaço em disco (S3)

## Logs Gerados

```
Iniciando exclusão de 3 processo(s): id1, id2, id3
Processo id1 deletado com sucesso (status: COMPLETED)
Processo id2 pulado - status: IN_PROGRESS
Arquivo ZIP zip-key-123 deletado do S3 para processo id3
Processo id3 deletado com sucesso (status: COMPLETED)
Exclusão concluída - Deletados: 2, Pulados: 1, Erros: 0
```
