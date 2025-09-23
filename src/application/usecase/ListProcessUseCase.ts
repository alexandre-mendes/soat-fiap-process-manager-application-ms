
export interface ListProcessUseCase {
    execute(userId: string): Promise<ProcessOutput[]>;
}

export interface ProcessOutput {
    id: string;
    user: { id: string; name: string };
    fileName: string;
    fileId: string;
    createdAt: Date;
    status: string;
    zipKey?: string;
}