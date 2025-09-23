import { Router } from 'express';
import { processController } from '../config/di-config';
import { errorHandler } from './errorHandler';
import multer from 'multer';

const userRouter = Router();
const upload = multer();

userRouter.get('/api/process-manager', errorHandler(processController.listProcess.bind(processController)));
userRouter.post('/api/process-manager/upload', upload.single("video"), errorHandler(processController.upload.bind(processController)));
userRouter.get('/api/process-manager/:processId/download', errorHandler(processController.downloadZip.bind(processController)));
userRouter.delete('/api/process-manager', errorHandler(processController.deleteProcesses.bind(processController)));

export default userRouter;