import { DomainError } from "../../../../domain/error/DomainError";
import { FileStorageGateway } from "../../../gateway/FileStorageGateway";
import { ProcessRepository } from "../../../repository/ProcessRepository";
import { DownloadProcessZipUseCase } from "../../DownloadProcessZipUseCase";
import { Readable } from "stream";

export class DefaultDownloadProcessZipUseCase implements DownloadProcessZipUseCase {

    constructor(
        private processRepository: ProcessRepository,
        private fileStorageGateway: FileStorageGateway
    ) {}

    async execute(processId: string): Promise<{ 
        fileName: string; 
        fileStream: Readable; 
        contentType: string;
        contentLength?: number;
    }> {
        const process = await this.processRepository.findById(processId);
        if (!process) {
            throw new DomainError(`Processo com ID ${processId} não encontrado`);
        }

        if (!process.zipKey) {
            throw new DomainError(`Processo ${processId} não possui arquivo ZIP disponível para download`);
        }

        if (process.status !== 'COMPLETED') {
            throw new DomainError(`Processo ${processId} ainda não foi completado. Status atual: ${process.status}`);
        }

        console.log(`Iniciando download do ZIP para processo ${processId} com zipKey: ${process.zipKey}`);

        try {
            const { stream, contentType, contentLength } = await this.fileStorageGateway.downloadFile(process.zipKey);
            const fileName = `${process.fileName}-result.zip`;
            
            console.log(`Download do ZIP iniciado com sucesso para processo ${processId}`);
            
            return {
                fileName,
                fileStream: stream,
                contentType,
                contentLength
            };
        } catch (error) {
            console.error(`Erro ao fazer download do ZIP para processo ${processId}:`, error);
            throw new DomainError(`Erro ao fazer download do arquivo ZIP: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
}
