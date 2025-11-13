declare module 'swagger-ui-express' {
  import { RequestHandler } from 'express';

  interface SwaggerUi {
    serve: RequestHandler[];
    setup(swaggerDoc: any, customOptions?: any): RequestHandler;
  }

  const swaggerUi: SwaggerUi;
  export default swaggerUi;
}
