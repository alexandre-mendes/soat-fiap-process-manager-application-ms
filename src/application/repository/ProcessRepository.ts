import { Process } from '../../domain/entity/Process';

export interface ProcessRepository {
    listByUserId(userId: string): Promise<Process[]>;
    save(process: Process): Promise<Process>;
    findById(id: string): Promise<Process | undefined>;
    deleteById(id: string): Promise<void>;
}