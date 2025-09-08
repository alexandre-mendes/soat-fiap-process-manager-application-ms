export interface DownloadProcessZipUseCase {
    execute(processId: string): Promise<{ fileName: string; fileStream: ReadableStream; contentType: string }>;
}
