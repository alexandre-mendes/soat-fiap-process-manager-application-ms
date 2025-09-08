import { ProcessRepository } from "../../../repository/ProcessRepository";
import { ListProcessUseCase, ProcessOutput } from "../../ListProcessUseCase";

export class DefaultListProcessUseCase implements ListProcessUseCase {

    constructor(private processRepository: ProcessRepository) { }

    async execute(): Promise<ProcessOutput[]> {
        const processes = await this.processRepository.listAll();
        return processes.map(process => ({
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

