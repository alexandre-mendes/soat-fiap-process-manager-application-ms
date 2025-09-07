import { UserGateway } from "../../application/gateway/UserGateway";
import { Output } from "../../application/usecase/ValidateTokenUseCase";
import { UserVO } from "../../domain/vo/UserVO";
import { RequestContextService } from "../context/RequestContextService";
import { HttpClient } from "./httpclient/HttpClient";

export class DefaultUserGateway implements UserGateway {

    constructor(private userHttpClient: HttpClient) { }

    async validateToken(token: string): Promise<Output> {
        const response = await this.userHttpClient.post(`/api/auth/validate`, {}, {
            Authorization: `Bearer ${token}`
        });
        return response.data;
    }

    async findById(): Promise<UserVO | undefined> {
        const userId = RequestContextService.getUserId();
        return this.userHttpClient.get(`/api/users/${userId}`, {
            Authorization: `Bearer ${RequestContextService.getToken()}`
        });
    }

}