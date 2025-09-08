import { DomainError } from "../error/DomainError";
import { UserVO } from "../vo/UserVO";

export enum ProcessStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
}

export class Process {

    private _id: string;
    private _user: UserVO;
    private _fileName: string;
    private _fileId: string;
    private _createdAt: Date;
    private _status: string;
    private _zipKey?: string;

    constructor(user: UserVO, fileName: string, fileId: string) {
        if (!user || !user.id) {
            throw new DomainError("Usuário inválido");
        }
        if (!fileName) {
            throw new DomainError("Nome do arquivo inválido");
        }
        if (!fileId) {
            throw new DomainError("ID do arquivo inválido");
        }

        this._id = crypto.randomUUID();
        this._user = user;
        this._fileName = fileName;
        this._fileId = fileId;
        this._createdAt = new Date();
        this._status = ProcessStatus.PENDING;
    }

    updateStatus(status: ProcessStatus, zipKey?: string) {
        const validStatuses = [ProcessStatus.PENDING, ProcessStatus.IN_PROGRESS, ProcessStatus.COMPLETED, ProcessStatus.FAILED];
        if (!validStatuses.includes(status)) {
            throw new DomainError(`Status inválido: ${status}. Valores aceitos: ${validStatuses.join(', ')}`);
        }
        this._status = status;
        
        if (status === ProcessStatus.COMPLETED && zipKey) {
            this._zipKey = zipKey;
        }
    }

    get id() {
        return this._id;
    }

    get user() {
        return this._user;
    }   

    get fileName() {
        return this._fileName;
    }

    get fileId() {
        return this._fileId;
    }

    get createdAt() {
        return this._createdAt;
    }

    get status() {
        return this._status;
    }   

    get zipKey() {
        return this._zipKey;
    }   

    set id(id: string) {
        this._id = id;
    }

    set createdAt(createdAt: Date) {
        this._createdAt = createdAt;
    }

    set status(status: string) {
        this._status = status;
    }

    set zipKey(zipKey: string | undefined) {
        this._zipKey = zipKey;
    }
}