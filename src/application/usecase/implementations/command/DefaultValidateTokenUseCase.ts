import { UserGateway } from "../../../gateway/UserGateway";
import { Output, ValidateTokenUseCase } from "../../ValidateTokenUseCase";

export class DefaultValidateTokenUseCase implements ValidateTokenUseCase {

    constructor(private userGateway: UserGateway) {}

    async execute(token: string): Promise<Output> {
        try {
            const response = await this.userGateway.validateToken(token);
            return response;
        } catch (error) {
            return { valid: false };
        }
    }
}