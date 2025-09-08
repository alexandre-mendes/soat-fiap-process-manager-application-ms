export interface UpdateProcessStatusUseCase {
    execute(processId: string, status: string, zipKey?: string): Promise<void>;
}
