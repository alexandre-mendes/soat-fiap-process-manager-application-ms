import { Request, Response } from "express";
import { UploadUseCase } from "../../../application/usecase/UploadUseCase";
import { ListProcessUseCase } from "../../../application/usecase/ListProcessUseCase";

export class ProcessController {

    constructor(private uploadUseCase: UploadUseCase, private listProcessUseCase: ListProcessUseCase) {
    }

    async listProcess(req: Request, res: Response) {
        const process = await this.listProcessUseCase.execute();
        return res.json(process).status(200);
    }

    async upload(req: Request, res: Response) {
        const user = await this.uploadUseCase.execute(req.file as Express.Multer.File, req.query.userId as string);
        return res.json(user).status(200);
    }
}
