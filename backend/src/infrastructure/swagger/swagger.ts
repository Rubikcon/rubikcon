import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// Add global bearer auth
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

export function generateOpenAPI() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Rubikcon Backend API',
      description: 'API documentation for Rubikcon Backend',
    },
    servers: [{ url: '/api' }],
  });
}

export function setupSwagger(app: Application) {
  const document = generateOpenAPI();
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(document));
}
