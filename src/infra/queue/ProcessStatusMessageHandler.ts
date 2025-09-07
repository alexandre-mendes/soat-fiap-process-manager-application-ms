
import { UpdateProcessStatusUseCase } from "../../application/usecase/UpdateProcessStatusUseCase";
import { IMessageConsumer } from "./sqs";

export class ProcessStatusMessageHandler {
    constructor(
        private messageConsumer: IMessageConsumer,
        private updateProcessStatusUseCase: UpdateProcessStatusUseCase
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
        
            const { processId, status } = message;
            
            if (!processId || !status) {
                throw new Error(`Mensagem inválida - processId: ${processId}, status: ${status}`);
            }

            await this.updateProcessStatusUseCase.execute(processId, status);
            
            console.log(`Mensagem processada com sucesso - processId: ${processId}, status: ${status}`);
        } catch (error) {
            console.error("Erro ao processar mensagem:", error);
            throw error; // Re-throw para que o consumer possa lidar com a mensagem (rejeitar ou reenviar)
        }
    }

    async stopProcessing(): Promise<void> {
        console.log("Parando processamento de mensagens...");
        this.messageConsumer.stopPolling();
    }
}
