export interface DeleteProcessUseCase {
    execute(processIds: string[]): Promise<{ deletedCount: number; skippedCount: number; errors: string[] }>;
}
