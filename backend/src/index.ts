import 'reflect-metadata';
import "dotenv/config";
//import app from "./app.js";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';


//const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api'); // opcional
    await app.listen(3000);
    console.log(`🚀 Servidor corriendo en http://localhost:3000/api`);
}
bootstrap();