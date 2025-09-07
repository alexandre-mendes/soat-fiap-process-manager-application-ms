
export interface IDatabase<E> {

    save(entity: E): Promise<E>;
    update(entity: E): Promise<E>;
    deleteById(id: string): Promise<void>;
    findById(id: string): Promise<E | null>;
    findByQuery(query: DBQuery): Promise<E>;
    findAllByQuery(query: DBQuery): Promise<E[]>;
}

export class DBQuery {

    private _and: DBCriteria<any>[] = [];
    private _orderBy: { [sort: string]: 'asc' | 'desc' } = {};

    constructor() { }

    add<T>(criteria: DBCriteria<T>) {
        this._and.push(criteria);
    }

    orderBy(sort: string, direction: 'asc' | 'desc') {
        this._orderBy[sort] = direction;
    }

    get andCriteria() {
        return this._and;
    }

    get sort() {
        return this._orderBy;
    }
}

export class DBCriteria<T> {

    constructor(readonly key: string, readonly value: T, readonly operation: DBOperation) { }
}

export class Filter {
    [key: string]: any;

    addCriteria<T>(criteria: DBCriteria<T>): void {
        switch (criteria.operation) {
            case DBOperation.EQUALS:
                this[criteria.key] = criteria.value;
                break;
            case DBOperation.NOT_EQUALS:
                this[criteria.key] = { $ne: criteria.value };
                break;
            default:
                throw new Error('Operation not suported')
        }
    }
}

export enum DBOperation {
    EQUALS,
    NOT_EQUALS
}