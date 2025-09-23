import { ProcessRepository } from "../../application/repository/ProcessRepository";
import { Process } from "../../domain/entity/Process";
import { DBCriteria, DBOperation, DBQuery, IDatabase } from "./dynamo/IDatabase";
import { IProcess } from "./dynamo/ProcessDynamoDatabase";

export class DefaultProcessRepository implements ProcessRepository {

    constructor(private database: IDatabase<IProcess>) { }
    

    async listByUserId(userId: string): Promise<Process[]> {
        const query = new DBQuery();
        query.add(new DBCriteria('user.id', userId, DBOperation.EQUALS));
        query.orderBy('createdAt', 'desc');
        
        const process = await this.database.findAllByQuery(query);
        return process.map(this.parseToEntity);
    }

    async save(process: Process): Promise<Process> {
        const db = this.parseToDB(process);
        const saved = await this.database.save(db);
        return this.parseToEntity(saved as IProcess);
    }

    async findById(id: string): Promise<Process | undefined> {
        const query = new DBQuery();
        query.add(new DBCriteria('id', id, DBOperation.EQUALS));
        const finded = await this.database.findByQuery(query);

        if (finded)
            return this.parseToEntity(finded);
        return undefined;
    }

    async deleteById(id: string): Promise<void> {
        await this.database.deleteById(id);
    }

    private parseToDB(entity: Process) {
        return { 
            id: entity.id, 
            user: entity.user, 
            fileName: entity.fileName, 
            fileId: entity.fileId, 
            createdAt: entity.createdAt?.toISOString(), 
            status: entity.status,
            zipKey: entity.zipKey
        } as IProcess;
    }

    private parseToEntity(db: IProcess) {
        const entity = new Process(db.user, db.fileName, db.fileId);
        entity.id = db.id;
        entity.createdAt = new Date(db.createdAt);
        entity.status = db.status;
        entity.zipKey = db.zipKey;
        return entity;
    }
}
