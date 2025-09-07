export interface UploadUseCase {
    execute(file: Express.Multer.File, userId: string): Promise<string>;
}