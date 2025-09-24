import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

const swaggerRouter = Router();

// Carregar o arquivo YAML do Swagger
const swaggerDocument = YAML.load('./swagger.yaml');

// Configurações otimizadas do Swagger UI para downloads grandes
const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
        // Timeout para requests longos (5 minutos)
        requestTimeout: 300000,
        // Configurações para downloads de arquivos
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
        // Não tentar fazer parse de responses binários
        responseInterceptor: (response: any) => {
            // Para downloads de arquivos ZIP, não tentar fazer parse
            if (response.headers['content-type']?.includes('application/zip')) {
                return response;
            }
            return response;
        },
        // Configurações de request
        requestInterceptor: (request: any) => {
            // Adicionar timeout personalizado para download endpoints
            if (request.url.includes('/download')) {
                request.timeout = 300000; // 5 minutos
            }
            return request;
        }
    },
    customCss: `
        .swagger-ui .download-contents {
            max-height: none !important;
        }
        .swagger-ui .response-col_description {
            max-height: none !important;
        }
        /* Melhor visualização para responses grandes */
        .swagger-ui .response-col_description__inner {
            max-height: 500px;
            overflow-y: auto;
        }
    `
};

// Configurar o Swagger UI para usar o arquivo YAML
swaggerRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

export default swaggerRouter;