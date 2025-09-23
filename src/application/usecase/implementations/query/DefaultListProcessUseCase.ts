import { ProcessRepository } from "../../../repository/ProcessRepository";
import { ListProcessUseCase, ProcessOutput } from "../../ListProcessUseCase";

export class DefaultListProcessUseCase implements ListProcessUseCase {

    constructor(private processRepository: ProcessRepository) { }

    async execute(userId: string): Promise<ProcessOutput[]> {
        const processes = await this.processRepository.listByUserId(userId);
        
        // A ordenação já é feita no banco, mas mantemos como fallback
        const sortedProcesses = processes.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        return sortedProcesses.map(process => ({
            id: process.id,
            user: { id: process.user?.id, name: process.user?.name },
            fileName: process.fileName,
            fileId: process.fileId,
            createdAt: process.createdAt,
            status: process.status,
            zipKey: process.zipKey
        }));
    }
}

