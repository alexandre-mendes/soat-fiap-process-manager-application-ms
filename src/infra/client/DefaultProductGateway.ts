import { UserGateway } from "../../application/gateway/UserGateway";
import { UserVO } from "../../domain/vo/UserVO";
import { HttpClient } from "./httpclient/HttpClient";

export class DefaultUserGateway implements UserGateway {

    constructor(private userHttpClient: HttpClient) {}
    
    findById(userId: string): Promise<UserVO | undefined> {
        return this.userHttpClient.get(`/api/users/${userId}`);
    }
    
}