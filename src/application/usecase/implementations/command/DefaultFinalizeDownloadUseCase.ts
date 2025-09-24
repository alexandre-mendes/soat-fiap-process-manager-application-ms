import { DomainError } from "../../../../domain/error/DomainError";
import { ProcessStatus } from "../../../../domain/entity/Process";
import { FileStorageGateway } from "../../../gateway/FileStorageGateway";
import { ProcessRepository } from "../../../repository/ProcessRepository";

export interface FinalizeDownloadUseCase {
    execute(processId: string): Promise<void>;
}

export class DefaultFinalizeDownloadUseCase implements FinalizeDownloadUseCase {
    
    constructor(
        private processRepository: ProcessRepository,
        private fileStorageGateway: FileStorageGateway
    ) {}

    async execute(processId: string): Promise<void> {
        console.log(`[FINALIZE USE CASE] Iniciando finalização para processo ${processId}`);
        
        const process = await this.processRepository.findById(processId);
        if (!process) {
            throw new DomainError(`Processo com ID ${processId} não encontrado`);
        }

        if (!process.zipKey) {
            console.log(`[FINALIZE USE CASE] Processo ${processId} não possui zipKey, pulando limpeza`);
            return;
        }

        try {
            // 1. Atualizar status para DOWNLOADED
            console.log(`[FINALIZE USE CASE] Atualizando status do processo ${processId} para DOWNLOADED`);
            process.updateStatus(ProcessStatus.DOWNLOADED);
            await this.processRepository.save(process);
            console.log(`[FINALIZE USE CASE] Status atualizado com sucesso`);
            
            // 2. Deletar arquivo do S3
            console.log(`[FINALIZE USE CASE] Deletando arquivo ${process.zipKey} do S3`);
            await this.fileStorageGateway.deleteFile(process.zipKey);
            console.log(`[FINALIZE USE CASE] Arquivo deletado com sucesso do S3`);
            
        } catch (error) {
            console.error(`[FINALIZE USE CASE] Erro na finalização:`, error);
            throw new DomainError(`Erro ao finalizar download: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }
}