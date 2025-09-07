import { AsyncLocalStorage } from "async_hooks";

export interface RequestContext {
    token?: string;
    userId?: string;
}

export class RequestContextService {

    private static storage = new AsyncLocalStorage<RequestContext>();

    static run<T>(context: RequestContext, callback: () => T): T {
        return RequestContextService.storage.run(context, callback);
    }

    static getToken(): string | undefined {
        const store = RequestContextService.storage.getStore();
        return store?.token;
    }

    static getUserId(): string | undefined {
        const store = RequestContextService.storage.getStore();
        return store?.userId;
    }

    static setToken(token: string): void {
        const store = RequestContextService.storage.getStore();
        if (store) {
            store.token = token;
        } else {
            throw new Error('Context não está ativo. Chame RequestContextService.run() primeiro.');
        }
    }

    static setUserId(userId: string): void {
        const store = RequestContextService.storage.getStore();
        if (store) {
            store.userId = userId;
        } else {
            throw new Error('Context não está ativo. Chame RequestContextService.run() primeiro.');
        }
    }
}