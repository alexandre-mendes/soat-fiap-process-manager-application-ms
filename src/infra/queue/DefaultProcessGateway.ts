import { ProcessGateway } from "../../application/gateway/ProcessGateway";
import { Process } from "../../domain/entity/Process";
import { IMessageProducer } from "./sqs";

export class DefaultProcessGateway implements ProcessGateway {

    constructor(private messageProducer: IMessageProducer) {}

    async send(process: Process): Promise<void> {
        await this.messageProducer.send({ processId: process.id, fileId: process.fileId });
    }
}