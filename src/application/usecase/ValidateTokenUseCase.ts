export interface Output {
    valid: boolean;
    decoded?: any;
}

export interface ValidateTokenUseCase {
    execute(token: string): Promise<Output>;
}
