import { Process } from '../../domain/entity/Process';

export interface ProcessRepository {
    listAll(): Promise<Process[]>;
    save(process: Process): Promise<Process>;
    findById(id: string): Promise<Process | undefined>;
}