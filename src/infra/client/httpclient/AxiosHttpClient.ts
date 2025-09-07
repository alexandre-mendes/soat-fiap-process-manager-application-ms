import axios, { AxiosInstance } from "axios";
import { HttpClient } from "./HttpClient";

export class AxiosHttpClient implements HttpClient {

    private api: AxiosInstance;

    constructor(private baseUrl: string) {
        this.api = axios.create({
            baseURL: baseUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async post<T>(path: string, body: any, headers: any): Promise<T> {
        return this.api.post(path, body, { headers });
    }

    async put<T>(path: string, body: any, headers: any): Promise<T> {
        return this.api.put(path, body, { headers });
    }

    async delete<T>(path: string, headers: any): Promise<T> {
        return this.api.delete(path, { headers });
    }

    async get<T>(path: string, headers?: any): Promise<T> {
        const response = await this.api.get(path, { headers });
        return response.data
    }

}