import { Process } from "../../domain/entity/Process";

export interface ProcessGateway {
    send(process: Process): Promise<void>;
}