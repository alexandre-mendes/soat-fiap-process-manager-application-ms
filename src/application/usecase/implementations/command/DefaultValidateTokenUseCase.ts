import { UserGateway } from "../../../gateway/UserGateway";
import { Output, ValidateTokenUseCase } from "../../ValidateTokenUseCase";

export class DefaultValidateTokenUseCase implements ValidateTokenUseCase {

    constructor(private userGateway: UserGateway) {}

    execute(token: string): Promise<Output> {
        return this.userGateway.validateToken(token);
    }
}