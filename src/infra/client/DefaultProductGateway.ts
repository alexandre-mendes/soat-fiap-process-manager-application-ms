import { UserGateway } from "../../application/gateway/UserGateway";
import { Output } from "../../application/usecase/ValidateTokenUseCase";
import { UserVO } from "../../domain/vo/UserVO";
import { HttpClient } from "./httpclient/HttpClient";

export class DefaultUserGateway implements UserGateway {

    constructor(private userHttpClient: HttpClient) {}
    
    validateToken(token: string): Promise<Output> {
        return this.userHttpClient.post(`/api/auth/validate`, { token });
    }
    
    findById(userId: string): Promise<UserVO | undefined> {
        return this.userHttpClient.get(`/api/users/${userId}`);
    }
    
}