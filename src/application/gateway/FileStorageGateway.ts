export interface FileStorageGateway {
    uploadFile(file: Express.Multer.File): Promise<string>;
    downloadFile(zipKey: string): Promise<ReadableStream>;
    deleteFile(zipKey: string): Promise<void>;
}