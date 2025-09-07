import { UserVO } from "../../domain/vo/UserVO";

export interface UserGateway {
    findById(id: string): Promise<UserVO | undefined>;
}