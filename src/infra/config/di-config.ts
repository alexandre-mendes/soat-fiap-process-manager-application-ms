
import { ProcessController } from "../api/controller/ProcessController";
import { DynamoDb } from "../database/dynamo/DynamoConfig";
import { IDatabase } from "../database/dynamo/IDatabase";
import { UploadUseCase } from '../../application/usecase/UploadUseCase';
import { DefaultUploadUseCase } from "../../application/usecase/implementations/command/DefaultUploadUseCase";
import { FileStorageGateway } from '../../application/gateway/FileStorageGateway';
import { DefaultFileStorageGateway } from "../storage/DefaultFileStorageGateway";
import { ProcessRepository } from "../../application/repository/ProcessRepository";
import { DefaultProcessRepository } from "../database/DefaultProcessRepository";
import { IProcess, ProcessDynamoDatabase } from "../database/dynamo/ProcessDynamoDatabase";
import { UserGateway } from "../../application/gateway/UserGateway";
import { DefaultUserGateway } from "../client/DefaultProductGateway";
import { AxiosHttpClient } from "../client/httpclient/AxiosHttpClient";
import { ListProcessUseCase } from "../../application/usecase/ListProcessUseCase";
import { DefaultListProcessUseCase } from "../../application/usecase/implementations/query/DefaultListProcessUseCase";
import { ProcessGateway } from "../../application/gateway/ProcessGateway";
import { DefaultProcessGateway } from "../queue/DefaultProcessGateway";
import { IMessageProducer, SqsMessageProducer } from "../queue/sqs";
import { UpdateProcessStatusUseCase } from "../../application/usecase/UpdateProcessStatusUseCase";
import { DefaultUpdateProcessStatusUseCase } from "../../application/usecase/implementations/command/DefaultUpdateProcessStatusUseCase";
import { IMessageConsumer, SqsMessageConsumer } from "../queue/sqs";
import { ProcessStatusMessageHandler } from "../queue/ProcessStatusMessageHandler";
import { ValidateTokenUseCase } from "../../application/usecase/ValidateTokenUseCase";
import { DefaultValidateTokenUseCase } from "../../application/usecase/implementations/command/DefaultValidateTokenUseCase";
import { DownloadProcessZipUseCase } from "../../application/usecase/DownloadProcessZipUseCase";
import { DefaultDownloadProcessZipUseCase } from "../../application/usecase/implementations/command/DefaultDownloadProcessZipUseCase";
import { DeleteProcessUseCase } from "../../application/usecase/DeleteProcessUseCase";
import { DefaultDeleteProcessUseCase } from "../../application/usecase/implementations/command/DefaultDeleteProcessUseCase";
import { MetricsController } from "../api/controller/MetricsController";


/*
    Http Client
*/
const userHttpClient = new AxiosHttpClient(process.env.USERS_BASE_URL || '');

/*
    Dynamo
*/
const dynamo = new DynamoDb();

/*
    IDatabase - Dynamo
*/
const processDatabase: IDatabase<IProcess> = new ProcessDynamoDatabase(dynamo)

/*
    Repositories
*/
const userRepository: ProcessRepository = new DefaultProcessRepository(processDatabase);


/*
    Queue
*/
const messageProducer: IMessageProducer = new SqsMessageProducer(process.env.AWS_SQS_PRODUCER_QUEUE_URL || '');
const messageConsumer: IMessageConsumer = new SqsMessageConsumer(process.env.AWS_SQS_CONSUMER_QUEUE_URL || '');

/* 
    Gateways
*/
const fileStorageGateway: FileStorageGateway = new DefaultFileStorageGateway();
const userGateway: UserGateway = new DefaultUserGateway(userHttpClient);
const processGateway: ProcessGateway = new DefaultProcessGateway(messageProducer);

/*
    Use Cases
*/
const uploadUseCase: UploadUseCase = new DefaultUploadUseCase(userRepository, fileStorageGateway, userGateway, processGateway);
const listProcessUseCase: ListProcessUseCase = new DefaultListProcessUseCase(userRepository);
const updateProcessStatusUseCase: UpdateProcessStatusUseCase = new DefaultUpdateProcessStatusUseCase(userRepository);
const validateTokenUseCase: ValidateTokenUseCase = new DefaultValidateTokenUseCase(userGateway);
const downloadProcessZipUseCase: DownloadProcessZipUseCase = new DefaultDownloadProcessZipUseCase(userRepository, fileStorageGateway);
const deleteProcessUseCase: DeleteProcessUseCase = new DefaultDeleteProcessUseCase(userRepository, fileStorageGateway);

/*
    Message Handlers
*/
const processStatusMessageHandler = new ProcessStatusMessageHandler(messageConsumer, updateProcessStatusUseCase);

/*
    Controllers
*/
const processController = new ProcessController(uploadUseCase, listProcessUseCase, downloadProcessZipUseCase, deleteProcessUseCase);
const metricsController = new MetricsController();

export { processController, metricsController, processStatusMessageHandler, validateTokenUseCase };
