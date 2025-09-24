import { Readable } from "stream";

export interface FileStorageGateway {
    uploadFile(file: Express.Multer.File): Promise<string>;
    downloadFile(zipKey: string): Promise<{
        stream: Readable;
        contentType: string;
        contentLength?: number;
    }>;
    deleteFile(zipKey: string): Promise<void>;
}