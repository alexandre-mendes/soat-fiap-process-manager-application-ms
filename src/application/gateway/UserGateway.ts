import { UserVO } from "../../domain/vo/UserVO";
import { Output } from "../usecase/ValidateTokenUseCase";

export interface UserGateway {
    validateToken(token: string): Promise<Output>;
    findById(id: string): Promise<UserVO | undefined>;
}