import { ProcessStatus } from "../../../../domain/entity/Process";
import { DomainError } from "../../../../domain/error/DomainError";
import { ProcessRepository } from "../../../repository/ProcessRepository";
import { UpdateProcessStatusUseCase } from "../../UpdateProcessStatusUseCase";

export class DefaultUpdateProcessStatusUseCase implements UpdateProcessStatusUseCase {

    constructor(private processRepository: ProcessRepository) {}

    async execute(processId: string, status: string): Promise<void> {
        const process = await this.processRepository.findById(processId);
        if (!process) {
            throw new DomainError(`Processo com ID ${processId} não encontrado`);
        }

        console.log(`Atualizando processo ${processId}: ${process.status} -> ${status}`);
        
        process.updateStatus(status as ProcessStatus);
        await this.processRepository.save(process);
        
        console.log(`Status do processo ${processId} atualizado para ${status} com sucesso`);
    }
}
