export interface HttpClient {
    post(path: string, body: any, headers?: any): Promise<any>
    put(path: string, body: any, headers: any): Promise<any>
    delete(path: string, headers: any): Promise<any>
    get(path: string, headers?: any): Promise<any>
}