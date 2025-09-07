export interface UploadUseCase {
    execute(file: Express.Multer.File): Promise<string>;
}