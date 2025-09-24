import { Readable } from "stream";

export interface DownloadProcessZipUseCase {
    execute(processId: string): Promise<{ 
        fileName: string; 
        fileStream: Readable; 
        contentType: string;
        contentLength?: number;
    }>;
}
