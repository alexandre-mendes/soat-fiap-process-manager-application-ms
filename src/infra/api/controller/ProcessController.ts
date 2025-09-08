import { Request, Response } from "express";
import { UploadUseCase } from "../../../application/usecase/UploadUseCase";
import { ListProcessUseCase } from "../../../application/usecase/ListProcessUseCase";
import { DownloadProcessZipUseCase } from "../../../application/usecase/DownloadProcessZipUseCase";
import { RequestContextService } from "../../context/RequestContextService";

export class ProcessController {

    constructor(
        private uploadUseCase: UploadUseCase, 
        private listProcessUseCase: ListProcessUseCase,
        private downloadProcessZipUseCase: DownloadProcessZipUseCase
    ) {
    }

    async listProcess(req: Request, res: Response) {
        RequestContextService.run((req as any).context, async () => {
            const process = await this.listProcessUseCase.execute();
            return res.json(process).status(200);
        });
    }

    async upload(req: Request, res: Response) {
        RequestContextService.run((req as any).context, async () => {
            const user = await this.uploadUseCase.execute(req.file as Express.Multer.File);
            return res.json(user).status(200);
        });
    }

    async downloadZip(req: Request, res: Response) {
        await RequestContextService.run((req as any).context, async () => {
            const processId = req.params.processId;
            
            if (!processId) {
                return res.status(400).json({ message: 'processId é obrigatório' });
            }

            try {
                const { fileName, fileStream, contentType } = await this.downloadProcessZipUseCase.execute(processId);
                
                res.setHeader('Content-Type', contentType);
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                
                // Convert ReadableStream to Node.js Readable and pipe to response
                const reader = fileStream.getReader();
                
                const pump = async () => {
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            res.write(value);
                        }
                        res.end();
                    } catch (error) {
                        console.error('Erro ao fazer stream do arquivo:', error);
                        res.status(500).json({ message: 'Erro ao fazer download do arquivo' });
                    }
                };
                
                await pump();
                
            } catch (error) {
                console.error('Erro no download do ZIP:', error);
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                } else {
                    res.status(500).json({ message: 'Erro interno do servidor' });
                }
            }
        });
    }
}

