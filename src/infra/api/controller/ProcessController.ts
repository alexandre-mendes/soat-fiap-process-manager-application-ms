import { Request, Response } from "express";
import { UploadUseCase } from "../../../application/usecase/UploadUseCase";
import { ListProcessUseCase } from "../../../application/usecase/ListProcessUseCase";
import { RequestContextService } from "../../context/RequestContextService";

export class ProcessController {

    constructor(private uploadUseCase: UploadUseCase, private listProcessUseCase: ListProcessUseCase) {
    }

    async listProcess(req: Request, res: Response) {
        RequestContextService.run((req as any).context, async () => {
            const process = await this.listProcessUseCase.execute();
            return res.json(process).status(200);
        });
    }

    async upload(req: Request, res: Response) {
        RequestContextService.run((req as any).context, async () => {
            const user = await this.uploadUseCase.execute(req.file as Express.Multer.File);
            return res.json(user).status(200);
        });
    }
}

