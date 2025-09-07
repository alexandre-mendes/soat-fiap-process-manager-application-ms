import { Request, Response, NextFunction, Router } from 'express';

export type AsyncErrorHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export type Execution = (req: Request, res: Response) => Promise<any>;

export function errorHandler(execution: Execution): AsyncErrorHandler {
    return async function(req: Request, res: Response, next: NextFunction) {
        try 
        {
            await execution(req, res);
        }
        catch(error) 
        {
            next(error);
        }
    }
}