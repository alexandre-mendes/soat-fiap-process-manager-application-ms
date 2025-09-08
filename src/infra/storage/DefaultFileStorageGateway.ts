import { GetObjectCommand, PutObjectCommand, S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { FileStorageGateway } from "../../application/gateway/FileStorageGateway";
import { DomainError } from "../../domain/error/DomainError";

export class DefaultFileStorageGateway implements FileStorageGateway {

    private s3: S3Client;

    constructor() {
        this.s3 = new S3Client({
            region: process.env.AWS_REGION,
            endpoint: process.env.AWS_S3_ENDPOINT,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
            forcePathStyle: true,
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


    async downloadFile(zipKey: string): Promise<ReadableStream> {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: zipKey,
        };

        try {
            const data = await this.s3.send(new GetObjectCommand(params));
            if (data.Body) {
                return data.Body.transformToWebStream();
            } else {
                throw new DomainError(`Arquivo com chave ${zipKey} não encontrado`);
            }
        } catch (err) {
            console.error(`Erro ao baixar arquivo ${zipKey} do S3:`, err);
            throw new Error(`Erro ao baixar o arquivo ${zipKey} do S3`);
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