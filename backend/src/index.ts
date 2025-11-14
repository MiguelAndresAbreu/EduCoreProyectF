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
        '/auth/login': {
          post: {
            tags: ['Auth'],
            summary: 'Iniciar sesión',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginDto' },
                },
              },
            },
            responses: {
              200: {
                description: 'Autenticación correcta',
              },
              401: { description: 'Credenciales inválidas' },
            },
          },
        },
        '/auth/register': {
          post: {
            tags: ['Auth'],
            summary: 'Registrar un nuevo usuario',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RegisterDto' },
                },
              },
            },
            responses: {
              201: { description: 'Usuario creado' },
              400: { description: 'Datos inválidos o duplicados' },
            },
          },
        },
        '/auth/me': {
          get: {
            tags: ['Auth'],
            summary: 'Obtener el perfil autenticado',
            security: [{ bearerAuth: [] }],
            responses: {
              200: { description: 'Perfil completo del usuario autenticado' },
              401: { description: 'Token inválido o expirado' },
            },
          },
        },
        '/users': {
          get: {
            tags: ['Usuarios'],
            summary: 'Listar usuarios',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Listado de usuarios' } },
          },
          post: {
            tags: ['Usuarios'],
            summary: 'Crear usuario',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RegisterDto' },
                },
              },
            },
            responses: { 201: { description: 'Usuario creado' } },
          },
        },
        '/users/{id}': {
          get: {
            tags: ['Usuarios'],
            summary: 'Consultar usuario por ID',
            security: [{ bearerAuth: [] }],
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
            ],
            responses: { 200: { description: 'Usuario encontrado' }, 404: { description: 'No encontrado' } },
          },
          put: {
            tags: ['Usuarios'],
            summary: 'Actualizar usuario',
            security: [{ bearerAuth: [] }],
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
            responses: { 200: { description: 'Usuario actualizado' } },
          },
          delete: {
            tags: ['Usuarios'],
            summary: 'Eliminar usuario',
            security: [{ bearerAuth: [] }],
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
            ],
            responses: { 204: { description: 'Usuario eliminado' } },
          },
        },
        '/person/{id}': {
          get: {
            tags: ['Personas'],
            summary: 'Consultar datos personales',
            security: [{ bearerAuth: [] }],
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
            ],
            responses: { 200: { description: 'Persona encontrada' }, 403: { description: 'Acceso denegado' } },
          },
          put: {
            tags: ['Personas'],
            summary: 'Actualizar datos personales',
            security: [{ bearerAuth: [] }],
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Person' },
                },
              },
            },
            responses: { 200: { description: 'Persona actualizada' }, 403: { description: 'Acceso denegado' } },
          },
        },
        '/courses': {
          get: {
            tags: ['Cursos'],
            summary: 'Listar cursos',
            security: [{ bearerAuth: [] }],
            responses: { 200: { description: 'Listado de cursos' } },
          },
          post: {
            tags: ['Cursos'],
            summary: 'Crear curso',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Course' },
                },
              },
            },
            responses: { 201: { description: 'Curso creado' } },
          },
        },
        '/courses/{id}': {
          put: {
            tags: ['Cursos'],
            summary: 'Actualizar curso',
            security: [{ bearerAuth: [] }],
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
            ],
            responses: { 200: { description: 'Curso actualizado' } },
          },
          delete: {
            tags: ['Cursos'],
            summary: 'Eliminar curso',
            security: [{ bearerAuth: [] }],
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
            ],
            responses: { 204: { description: 'Curso eliminado' } },
          },
        },
        '/enrollments': {
          post: {
            tags: ['Inscripciones'],
            summary: 'Inscribir estudiante en un curso',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['studentId', 'courseId'],
                    properties: {
                      studentId: { type: 'integer' },
                      courseId: { type: 'integer' },
                      status: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: { 201: { description: 'Inscripción creada' } },
          },
        },
        '/enrollments/student/{id}': {
          get: {
            tags: ['Inscripciones'],
            summary: 'Inscripciones de un estudiante',
            security: [{ bearerAuth: [] }],
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
            ],
            responses: { 200: { description: 'Listado de inscripciones' } },
          },
        },
        '/attendance': {
          post: {
            tags: ['Asistencia'],
            summary: 'Registrar asistencia',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['courseId', 'studentId', 'date', 'status'],
                    properties: {
                      courseId: { type: 'integer' },
                      studentId: { type: 'integer' },
                      date: { type: 'string', format: 'date' },
                      status: {
                        type: 'string',
                        enum: ['PRESENT', 'ABSENT', 'LATE'],
                      },
                    },
                  },
                },
              },
            },
            responses: { 201: { description: 'Asistencia registrada' } },
          },
        },
        '/attendance/course/{courseId}': {
          get: {
            tags: ['Asistencia'],
            summary: 'Consultar asistencia por curso',
            security: [{ bearerAuth: [] }],
            parameters: [
              { name: 'courseId', in: 'path', required: true, schema: { type: 'integer' } },
              { name: 'date', in: 'query', required: false, schema: { type: 'string', format: 'date' } },
            ],
            responses: { 200: { description: 'Listado de asistencias' } },
          },
        },
        '/grades': {
          post: {
            tags: ['Calificaciones'],
            summary: 'Registrar calificación',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['courseId', 'studentId', 'type', 'score', 'maxScore', 'date'],
                    properties: {
                      courseId: { type: 'integer' },
                      studentId: { type: 'integer' },
                      type: { type: 'string' },
                      score: { type: 'number' },
                      maxScore: { type: 'number' },
                      date: { type: 'string', format: 'date' },
                    },
                  },
                },
              },
            },
            responses: { 201: { description: 'Calificación registrada' } },
          },
        },
        '/grades/student/{id}': {
          get: {
            tags: ['Calificaciones'],
            summary: 'Consultar calificaciones de un estudiante',
            security: [{ bearerAuth: [] }],
            parameters: [
              { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
            ],
            responses: { 200: { description: 'Listado de calificaciones' } },
          },
        },
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
