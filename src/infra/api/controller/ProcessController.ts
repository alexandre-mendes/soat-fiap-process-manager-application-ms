import { Request, Response } from "express";
import { UploadUseCase } from "../../../application/usecase/UploadUseCase";
import { ListProcessUseCase } from "../../../application/usecase/ListProcessUseCase";
import { DownloadProcessZipUseCase } from "../../../application/usecase/DownloadProcessZipUseCase";
import { DeleteProcessUseCase } from "../../../application/usecase/DeleteProcessUseCase";
import { RequestContextService } from "../../context/RequestContextService";
import { FinalizeDownloadUseCase } from "../../../application/usecase/implementations/command/DefaultFinalizeDownloadUseCase";

export class ProcessController {

    constructor(
        private uploadUseCase: UploadUseCase, 
        private listProcessUseCase: ListProcessUseCase,
        private downloadProcessZipUseCase: DownloadProcessZipUseCase,
        private deleteProcessUseCase: DeleteProcessUseCase,
        private finalizeDownloadUseCase: FinalizeDownloadUseCase
    ) {
    }

    async listProcess(req: Request, res: Response) {
        RequestContextService.run((req as any).context, async () => {
            const userId = RequestContextService.getUserId();
            
            if (!userId) {
                return res.status(401).json({ message: 'Usuário não identificado' });
            }
            
            const processes = await this.listProcessUseCase.execute(userId);
            return res.json(processes).status(200);
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
                console.log(`[DOWNLOAD] Iniciando download para processo: ${processId}`);
                
                const { fileName, fileStream, contentType, contentLength } = await this.downloadProcessZipUseCase.execute(processId);
                
                // Headers mínimos necessários para o Swagger funcionar
                res.setHeader('Content-Type', contentType || 'application/zip');
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                
                if (contentLength) {
                    res.setHeader('Content-Length', contentLength.toString());
                    console.log(`[DOWNLOAD] Arquivo: ${fileName}, Tamanho: ${contentLength} bytes`);
                }
                
                // Headers específicos para Swagger UI
                res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Type');
                res.setHeader('Cache-Control', 'no-cache');
                
                console.log(`[DOWNLOAD] Iniciando streaming...`);
                
                // Streaming direto - mais simples possível
                fileStream.pipe(res);
                
                // ✅ AQUI: Atualizar status e limpar arquivo após streaming concluído
                fileStream.on('end', async () => {
                    console.log(`[DOWNLOAD] Streaming concluído para ${fileName}`);
                    
                    try {
                        // Chamar endpoint para finalizar download (atualizar status + deletar arquivo)
                        console.log(`[DOWNLOAD] Finalizando processo ${processId}...`);
                        await this.finalizeDownload(processId);
                        console.log(`[DOWNLOAD] Processo ${processId} finalizado com sucesso`);
                    } catch (finalizeError) {
                        console.error(`[DOWNLOAD] Erro ao finalizar processo ${processId}:`, finalizeError);
                        // Não falhar o download por causa de erro de limpeza
                    }
                });
                
                fileStream.on('error', (error) => {
                    console.error(`[DOWNLOAD] Erro no streaming:`, error);
                    if (!res.headersSent) {
                        res.status(500).json({ message: 'Erro no download' });
                    }
                });
                
            } catch (error) {
                console.error(`[DOWNLOAD] Erro geral:`, error);
                if (!res.headersSent) {
                    if (error instanceof Error) {
                        res.status(400).json({ message: error.message });
                    } else {
                        res.status(500).json({ message: 'Erro interno do servidor' });
                    }
                }
            }
        });
    }

    // Método privado para finalizar download
    private async finalizeDownload(processId: string) {
        try {
            console.log(`[FINALIZE] Executando finalização para processo ${processId}...`);
            
            // Usar o use case de finalização
            await this.finalizeDownloadUseCase.execute(processId);
            
            console.log(`[FINALIZE] Processo ${processId} finalizado com sucesso`);
            
        } catch (error) {
            console.error(`[FINALIZE] Erro ao finalizar processo ${processId}:`, error);
            throw error;
        }
    }

    async deleteProcesses(req: Request, res: Response) {
        await RequestContextService.run((req as any).context, async () => {
            try {
                const { processIds } = req.body;

                if (!processIds || !Array.isArray(processIds) || processIds.length === 0) {
                    return res.status(400).json({ 
                        message: 'Campo processIds é obrigatório e deve ser um array não vazio' 
                    });
                }

                const result = await this.deleteProcessUseCase.execute(processIds);

                if (result.errors.length > 0) {
                    return res.status(207).json({
                        message: 'Exclusão parcialmente concluída',
                        ...result
                    });
                }

                return res.status(200).json({
                    message: 'Exclusão concluída com sucesso',
                    ...result
                });

            } catch (error) {
                console.error('Erro na exclusão de processos:', error);
                if (error instanceof Error) {
                    res.status(400).json({ message: error.message });
                } else {
                    res.status(500).json({ message: 'Erro interno do servidor' });
                }
            }
        });
    }
}

