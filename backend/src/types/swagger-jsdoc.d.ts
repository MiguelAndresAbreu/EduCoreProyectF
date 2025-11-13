declare module 'swagger-jsdoc' {
  type SwaggerDefinition = Record<string, unknown>;

  interface Options {
    definition: SwaggerDefinition;
    apis: string[];
  }

  export default function swaggerJsdoc(options: Options): SwaggerDefinition;
}
