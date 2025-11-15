import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
  );

  const allowedOrigins =
      process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()) ?? [
        'http://localhost:5173',
        'http://localhost:5174',
      ];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'EduCore ERP Escolar',
        description:
            'API REST para la gestión de autenticación, usuarios y módulos académicos del ERP Escolar.',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000/api',
          description: 'Servidor local',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          LoginDto: {
            type: 'object',
            required: ['identifier', 'password'],
            properties: {
              identifier: {
                type: 'string',
                description: 'Nombre de usuario o correo electrónico',
              },
              password: { type: 'string', format: 'password' },
            },
          },
          RegisterDto: {
            type: 'object',
            required: ['username', 'email', 'password', 'firstName', 'lastName'],
            properties: {
              username: { type: 'string' },
              email: { type: 'string', format: 'email' },
              password: { type: 'string', format: 'password' },
              role: {
                type: 'string',
                enum: ['ADMIN', 'TEACHER', 'STUDENT', 'STAFF', 'FINANCE'],
              },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              phone: { type: 'string' },
              address: { type: 'string' },
              birthDate: { type: 'string', format: 'date' },
              avatar: { type: 'string' },
            },
          },
          Person: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              email: { type: 'string' },
              phone: { type: 'string' },
              address: { type: 'string' },
              birthDate: { type: 'string', format: 'date' },
              avatar: { type: 'string' },
            },
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              username: { type: 'string' },
              email: { type: 'string' },
              role: {
                type: 'string',
                enum: ['ADMIN', 'TEACHER', 'STUDENT', 'STAFF', 'FINANCE'],
              },
              isActive: { type: 'boolean' },
              person: { $ref: '#/components/schemas/Person' },
            },
          },
          Course: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              schedule: { type: 'string' },
              capacity: { type: 'integer' },
              room: { type: 'string' },
            },
          },
          Enrollment: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              status: { type: 'string' },
              enrolledAt: { type: 'string', format: 'date-time' },
              course: { $ref: '#/components/schemas/Course' },
            },
          },
          Grade: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              type: { type: 'string' },
              score: { type: 'number' },
              maxScore: { type: 'number' },
              date: { type: 'string', format: 'date' },
            },
          },
          AttendanceRecord: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              date: { type: 'string', format: 'date' },
              status: { type: 'string', enum: ['PRESENT', 'ABSENT', 'LATE'] },
            },
          },
        },
      },
      security: [{ bearerAuth: [] }],
      tags: [
        { name: 'Auth', description: 'Autenticación y sesión' },
        { name: 'Usuarios', description: 'Administración de usuarios' },
        { name: 'Personas', description: 'Gestión de datos personales' },
        { name: 'Cursos', description: 'Gestión académica de cursos' },
        { name: 'Inscripciones', description: 'Inscripciones de estudiantes' },
        { name: 'Asistencia', description: 'Registro de asistencia' },
        { name: 'Calificaciones', description: 'Gestión de calificaciones' },
      ],
      paths: {
        // ... (todo tu objeto paths igual que lo tenías)
        // no hace falta tocar nada aquí para arreglar GraphQL
      },
    },
    apis: [],
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en http://localhost:${port}/api`);
}

bootstrap();
