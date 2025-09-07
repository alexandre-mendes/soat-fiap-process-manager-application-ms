#!/bin/bash

echo "Aguardando LocalStack inicializar..."
sleep 10

echo "Criando fila SQS..."
aws --endpoint-url=http://localhost:4566 sqs create-queue --queue-name video-processing-queue

echo "Criando bucket S3..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://process-videos

echo "Listando recursos criados..."
echo "Filas SQS:"
aws --endpoint-url=http://localhost:4566 sqs list-queues

echo "Buckets S3:"
aws --endpoint-url=http://localhost:4566 s3 ls

echo "Recursos LocalStack criados com sucesso!"
