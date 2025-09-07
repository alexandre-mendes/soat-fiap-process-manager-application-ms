export interface FileStorageGateway {
    uploadFile(file: Express.Multer.File): Promise<string>;
    getFileUrl(fileId: string): Promise<NodeJS.ReadableStream>;   
}