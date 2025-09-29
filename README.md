# 🚀 SOAT-FIAP Process Manager Application Microservice

## Visão Geral
Microserviço Node.js/TypeScript para orquestração de processamento de vídeos, arquitetura limpa, observabilidade e pronto para produção em Docker/Kubernetes. Métricas expostas para Prometheus/Grafana.

---

## 🧩 Arquitetura

- **Application**: Casos de uso (UseCases), gateways, interfaces de repositório
- **Domain**: Entidades (Process), value objects, erros de domínio
- **Infra**: Repositórios (DynamoDB), integração SQS/S3, middlewares, controllers REST, métricas, notificações (Mailtrap)
- **Testes**: Cobertura unitária/integrada com Jest
- **Observabilidade**: Métricas HTTP/sistema para Prometheus/Grafana
- **Deploy**: Docker/Kubernetes, CI/CD

---

## ✨ Funcionalidades

- Orquestração de Processos: Recebe, atualiza e finaliza status de processamento
- Integração com SQS: Envio/consumo de mensagens para filas de processamento
- Integração com S3: Upload/download de arquivos processados
- Notificações: Envio de e-mail via Mailtrap para status de processo
- Métricas: Requisições HTTP, latência, status, `/metrics` para Prometheus
- Health Check: `/health` para disponibilidade
- Swagger: `/api-docs` documentação interativa
- Testes Automatizados: Cobertura alta
- Configuração via .env, ConfigMap e Secret

---

## 🔗 Principais Endpoints

- `POST /api/process-manager` — Criação de novo processo
- `GET /api/process-manager/:id` — Consulta de processo
- `PATCH /api/process-manager/:id/status` — Atualização de status
- `GET /api/process-manager/:id/download` — Download de arquivo ZIP
- `GET /metrics` — Métricas Prometheus
- `GET /health` — Health check
- `GET /api-docs` — Swagger

---

## 📊 Observabilidade

- Métricas HTTP: total, latência, status
- Métricas de sistema: CPU, memória, event loop
- Pronto para Prometheus/Grafana

---

## 🧪 Testes

- Executar: `npm run test`
- Cobertura: `npm run test -- --coverage`

---

## 🚢 Deploy

- Dockerfile e docker-compose para local
- Arquivos Kubernetes (`k8s/`) para produção
- Secrets e ConfigMaps para variáveis sensíveis

---

## ▶️ Como rodar

1. Instale dependências: `npm install`
2. Configure variáveis em `.env` (ou via ConfigMap/Secret)
3. Suba o ambiente: `docker-compose up` ou `npm run dev`
4. Acesse endpoints conforme documentação

---
