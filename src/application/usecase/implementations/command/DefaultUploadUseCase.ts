import { Process } from "../../../../domain/entity/Process";
import { DomainError } from "../../../../domain/error/DomainError";
import { FileStorageGateway } from "../../../gateway/FileStorageGateway";
import { ProcessGateway } from "../../../gateway/ProcessGateway";
import { UserGateway } from "../../../gateway/UserGateway";
import { ProcessRepository } from "../../../repository/ProcessRepository";
import { UploadUseCase } from "../../UploadUseCase";

export class DefaultUploadUseCase implements UploadUseCase {
    constructor(
        private processRepository: ProcessRepository,
        private fileStorageService: FileStorageGateway,
        private userGateway: UserGateway,
        private processGateway: ProcessGateway
    ) { }

    async execute(file: Express.Multer.File, userId: string): Promise<string> {
        const user = await this.userGateway.findById(userId);
        if (!user) 
            throw new DomainError('Usuário não encontrado');

        const fileId = await this.fileStorageService.uploadFile(file);
        const process = new Process(user, file.originalname, fileId);
        await this.processRepository.save(process);
        await this.processGateway.send(process);
        return process.id;
    }
}