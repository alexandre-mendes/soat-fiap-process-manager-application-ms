import { ProcessStatus } from "../../../../domain/entity/Process";
import { DomainError } from "../../../../domain/error/DomainError";
import { FileStorageGateway } from "../../../gateway/FileStorageGateway";
import { ProcessRepository } from "../../../repository/ProcessRepository";
import { DeleteProcessUseCase } from "../../DeleteProcessUseCase";

export class DefaultDeleteProcessUseCase implements DeleteProcessUseCase {

    constructor(
        private processRepository: ProcessRepository,
        private fileStorageGateway: FileStorageGateway
    ) {}

    async execute(processIds: string[]): Promise<{ deletedCount: number; skippedCount: number; errors: string[] }> {
        if (!processIds || processIds.length === 0) {
            throw new DomainError("Lista de IDs de processos não pode estar vazia");
        }

        const result = {
            deletedCount: 0,
            skippedCount: 0,
            errors: [] as string[]
        };

        console.log(`Iniciando exclusão de ${processIds.length} processo(s): ${processIds.join(', ')}`);

        for (const processId of processIds) {
            try {
                const process = await this.processRepository.findById(processId);
                
                if (!process) {
                    result.errors.push(`Processo ${processId} não encontrado`);
                    continue;
                }

                if (process.status === ProcessStatus.IN_PROGRESS || process.status === ProcessStatus.PENDING) {
                    result.skippedCount++;
                    result.errors.push(`Processo ${processId} não pode ser deletado - está em andamento`);
                    console.log(`Processo ${processId} pulado - status: ${process.status}`);
                    continue;
                }

                // Deletar arquivo ZIP do S3 se existir (para processos COMPLETED que não foram baixados)
                if (process.zipKey && process.status === ProcessStatus.COMPLETED) {
                    try {
                        await this.fileStorageGateway.deleteFile(process.zipKey);
                        console.log(`Arquivo ZIP ${process.zipKey} deletado do S3 para processo ${processId}`);
                    } catch (deleteError) {
                        console.warn(`Aviso: Falha ao deletar arquivo ZIP ${process.zipKey} do S3:`, deleteError);
                        // Não impede a exclusão do processo se falhar ao deletar o arquivo
                    }
                }

                // Deletar processo do banco
                await this.processRepository.deleteById(processId);
                result.deletedCount++;
                
                console.log(`Processo ${processId} deletado com sucesso (status: ${process.status})`);

            } catch (error) {
                result.errors.push(`Erro ao deletar processo ${processId}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
                console.error(`Erro ao deletar processo ${processId}:`, error);
            }
        }

        console.log(`Exclusão concluída - Deletados: ${result.deletedCount}, Pulados: ${result.skippedCount}, Erros: ${result.errors.length}`);
        
        return result;
    }
}
