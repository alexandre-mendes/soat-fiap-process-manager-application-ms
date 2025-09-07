
export class DomainError extends Error {

    constructor(readonly message: string) {
        super(message);
    }
}