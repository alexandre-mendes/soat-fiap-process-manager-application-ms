export interface UpdateProcessStatusUseCase {
    execute(processId: string, status: string): Promise<void>;
}
