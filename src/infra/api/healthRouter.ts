import { Router } from "express";

const healthRouter = Router();

healthRouter.get('/health', (_, res) => {
    res.json({status: "UP"}).status(200);
});

export default healthRouter;