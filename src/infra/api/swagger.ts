import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const swaggerRouter = Router();

// Carregar o arquivo YAML do Swagger
const swaggerDocument = YAML.load('./swagger.yaml');

// Configurar o Swagger UI para usar o arquivo YAML
swaggerRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));


export default swaggerRouter;