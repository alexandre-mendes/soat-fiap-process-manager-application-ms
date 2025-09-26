

import { UpdateProcessStatusUseCase } from "../../application/usecase/UpdateProcessStatusUseCase";
import { IMessageConsumer } from "./sqs";
import { MailtrapService } from "../mail/MailtrapService";
import { ProcessRepository } from "../../application/repository/ProcessRepository";

export class ProcessStatusMessageHandler {
    constructor(
        private messageConsumer: IMessageConsumer,
        private updateProcessStatusUseCase: UpdateProcessStatusUseCase,
        private mailtrapService: MailtrapService,
        private processRepository: ProcessRepository
    ) {}

    async startProcessing(): Promise<void> {
        console.log("Iniciando processamento de mensagens de status de processo...");
        await this.messageConsumer.startPolling(
            async (message: any) => {
                await this.handleMessage(message);
            },
            {
                maxNumberOfMessages: 10,
                waitTimeSeconds: 20,
                pollInterval: 5000
            }
        );
    }

    private async handleMessage(message: any): Promise<void> {
        try {
            console.log("Processando mensagem:", JSON.stringify(message, null, 2));

            const { processId, status, zipKey } = message;

            if (!processId || !status) {
                throw new Error(`Mensagem inválida - processId: ${processId}, status: ${status}`);
            }

            await this.updateProcessStatusUseCase.execute(processId, status, zipKey);

            const zipKeyLog = zipKey ? `, zipKey: ${zipKey}` : '';
            console.log(`Mensagem processada com sucesso - processId: ${processId}, status: ${status}${zipKeyLog}`);

            // Busca o processo na base para obter o e-mail do usuário e envia notificação
            await this.sendProcessStatusEmail(processId, status);
        } catch (error) {
            console.error("Erro ao processar mensagem:", error);
            throw error; // Re-throw para que o consumer possa lidar com a mensagem (rejeitar ou reenviar)
        }
    }

    private async sendProcessStatusEmail(processId: string, status: string): Promise<void> {
        if (status !== 'FAILED' && status !== 'COMPLETED') return;
        const process = await this.processRepository.findById(processId);
        const userEmail = process?.user?.email;
        const userName = process?.user?.name || '';
        const fileName = process?.fileName || '';
        if (!userEmail) {
            console.warn(`E-mail do usuário não encontrado para o processo ${processId}`);
            return;
        }

        if (status === 'FAILED') {
            await this.mailtrapService.sendMail({
                to: userEmail,
                subject: 'Processamento falhou',
                html: `<h2>Olá, ${userName}</h2><p>O processamento do arquivo <b>${fileName}</b> falhou.</p><p>Por favor, tente novamente ou entre em contato com o suporte.</p><br><small>Equipe FIAP X</small>`
            });
            console.log(`E-mail de falha enviado para ${userEmail}`);
        } else if (status === 'COMPLETED') {
            await this.mailtrapService.sendMail({
                to: userEmail,
                subject: 'Processamento concluído',
                html: `<h2>Olá, ${userName}</h2><p>O arquivo <b>${fileName}</b> foi processado com sucesso!</p><p>Você já pode realizar o download.</p><br><small>Equipe FIAP X</small>`
            });
            console.log(`E-mail de sucesso enviado para ${userEmail}`);
        }
    }

}
