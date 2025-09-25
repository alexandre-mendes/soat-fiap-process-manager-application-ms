import { GetObjectCommand, PutObjectCommand, S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { FileStorageGateway } from "../../application/gateway/FileStorageGateway";
import { DomainError } from "../../domain/error/DomainError";
import { Readable } from "stream";

export class DefaultFileStorageGateway implements FileStorageGateway {

    private s3: S3Client;

    constructor() {
        this.s3 = new S3Client({
            region: process.env.AWS_REGION,
            endpoint: process.env.AWS_S3_ENDPOINT,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
                sessionToken: process.env.AWS_SESSION_TOKEN
            },
            forcePathStyle: true,
            // Configurações otimizadas para download de arquivos grandes
            requestHandler: {
                requestTimeout: 300000, // 5 minutos
                httpsAgent: {
                    maxSockets: 50,
                    keepAlive: true,
                    keepAliveMsecs: 1000,
                }
            }
        });
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: crypto.randomUUID(),
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        try {
            await this.s3.send(new PutObjectCommand(params));
            return params.Key;
        } catch (err) {
            console.error(err);
            throw new Error("Erro ao enviar para o S3");
        }
    }


    async downloadFile(zipKey: string): Promise<{
        stream: Readable;
        contentType: string;
        contentLength?: number;
    }> {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: zipKey,
            // Otimizações para download de arquivos grandes
            ResponseContentType: 'application/zip',
        };

        try {
            console.log(`[S3] Iniciando download do arquivo: ${zipKey}`);
            
            const data = await this.s3.send(new GetObjectCommand(params));
            
            if (data.Body) {
                // Convert S3 Body to Node.js Readable stream
                const stream = data.Body as Readable;
                
                // Configurações de stream para melhor performance
                stream.setMaxListeners(0);
                
                const result = {
                    stream,
                    contentType: data.ContentType || 'application/zip',
                    contentLength: data.ContentLength
                };
                
                console.log(`[S3] Stream criado para ${zipKey}: ${result.contentLength} bytes`);
                
                return result;
            } else {
                const err = new DomainError(`Arquivo com chave ${zipKey} não encontrado`);
                (err as any).$metadata = { httpStatusCode: 404 };
                throw err;
            }
        } catch (err: any) {
            console.error(`[S3] Erro ao baixar arquivo ${zipKey}:`, err);
            
            if (err.$metadata?.httpStatusCode === 404) {
                throw new DomainError(`Arquivo ${zipKey} não encontrado no S3`);
            }
            
            throw new Error(`Erro ao baixar o arquivo ${zipKey} do S3: ${err.message || 'Erro desconhecido'}`);
        }
    }

    async deleteFile(zipKey: string): Promise<void> {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: zipKey,
        };

        try {
            await this.s3.send(new DeleteObjectCommand(params));
            console.log(`Arquivo ${zipKey} deletado com sucesso do S3`);
        } catch (err) {
            console.error(`Erro ao deletar arquivo ${zipKey} do S3:`, err);
            throw new Error("Erro ao deletar o arquivo ZIP do S3");
        }
    }
}