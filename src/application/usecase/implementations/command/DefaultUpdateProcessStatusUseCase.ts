import { ProcessStatus } from "../../../../domain/entity/Process";
import { ProcessRepository } from "../../../repository/ProcessRepository";
import { UpdateProcessStatusUseCase } from "../../UpdateProcessStatusUseCase";

export class DefaultUpdateProcessStatusUseCase implements UpdateProcessStatusUseCase {

    constructor(private processRepository: ProcessRepository) {}

    async execute(processId: string, status: string, zipKey?: string): Promise<void> {
        const process = await this.processRepository.findById(processId);
        if (!process) return;

        console.log(`Atualizando processo ${processId}: ${process.status} -> ${status}`);
        
        process.updateStatus(status as ProcessStatus, zipKey);
        await this.processRepository.save(process);
        
        const zipKeyLog = zipKey ? ` com zipKey: ${zipKey}` : '';
        console.log(`Status do processo ${processId} atualizado para ${status}${zipKeyLog} com sucesso`);
    }
}
