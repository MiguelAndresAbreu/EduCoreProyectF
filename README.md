# EduCore ERP Escolar

EduCore es una solución ERP enfocada en instituciones educativas. El monorepo contiene:

- **Backend** NestJS/TypeORM que expone APIs REST protegidas con JWT para autenticación, gestión académica y administrativa.
- **Frontend** React + Vite que consume las APIs para ofrecer paneles de estudiantes, docentes, finanzas y personal administrativo.

Esta guía resume los requisitos, pasos de instalación y comandos necesarios para ejecutar el proyecto en un entorno local.

## Arquitectura general

| Módulo | Descripción |
| --- | --- |
| Backend (`/backend`) | API NestJS con módulos para autenticación, usuarios, cursos, calificaciones, asistencia, pagos, finanzas, notificaciones, incidencias y reportes. Utiliza TypeORM con PostgreSQL y genera documentación Swagger en `/api/docs`. |
| Frontend (`/frontend`) | Aplicación React con ruteo protegido, panel responsivo y vistas específicas para calificaciones, pagos, asistencia, incidencias, finanzas y perfil. Consume la API mediante un cliente Axios con autenticación por token almacenado en `localStorage`. |

## Requisitos previos

1. **Node.js 18 o superior** (se recomienda la versión LTS). Verifica con `node -v` y `npm -v`.
2. **npm** (incluido con Node.js) o **pnpm/yarn** si prefieres administradores alternativos.
3. **PostgreSQL 13+** en ejecución y accesible. Puedes usar Docker o un servicio local.
4. (Opcional) **Docker** si quieres levantar dependencias auxiliares como la base de datos mediante contenedores. Se provee un `docker-compose.yml` de ejemplo para SQL Server.

## Configuración del backend

1. Instala dependencias:
   ```bash
   cd backend
   npm install
   ```
2. Crea un archivo `.env` en `backend/` con la configuración de entorno necesaria:
   ```env
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=educore
   JWT_SECRET=supersecret
   ```
   Ajusta las credenciales según tu servidor PostgreSQL.
3. Inicializa la base de datos (crear BD `educore` o la que definas en `DB_NAME`).
4. Ejecuta la API en modo desarrollo:
   ```bash
   npm run dev
   ```
5. Otros scripts útiles:

   | Script | Descripción |
   | --- | --- |
   | `npm run start` | Levanta la API usando `node --loader tsx` (útil para entornos de staging). |
   | `npm run build` | Compila TypeScript a JavaScript en `dist/`. |
   | `npm run start:prod` | Ejecuta la versión compilada desde `dist/`. |
   | `npm run lint` | Ejecuta ESLint sobre el proyecto. |

6. La API quedará disponible en `http://localhost:3000/api`. La documentación interactiva Swagger se monta automáticamente en `http://localhost:3000/api/docs`.

## Configuración del frontend

1. Instala dependencias:
   ```bash
   cd frontend
   npm install
   ```
2. Crea un archivo `.env` en `frontend/` con la URL del backend:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```
3. Ejecuta la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```
   Vite abrirá la aplicación en `http://localhost:5173/` (o el puerto disponible indicado por la consola).

4. Otros scripts disponibles:

   | Script | Descripción |
   | --- | --- |
   | `npm run build` | Genera la build estática de producción en `dist/`. |
   | `npm run preview` | Sirve la build de producción para pruebas locales. |
   | `npm run lint` | Ejecuta ESLint sobre el código React. |

## Flujo típico de desarrollo

1. Levanta PostgreSQL (local o contenedor) y crea la base de datos especificada.
2. Inicia el backend (`npm run dev` en `/backend`) y espera a que NestJS muestre el mensaje `Application is running on: http://localhost:3000/api`.
3. Arranca el frontend (`npm run dev` en `/frontend`) y abre el navegador en `http://localhost:5173`.
4. Ingresa con un usuario existente o registra uno nuevo mediante `/api/auth/register` (el formulario de registro web está pendiente, pero la API está disponible). Luego inicia sesión en la interfaz para acceder al panel.

## Vista guiada de la aplicación

La ruta pública `/overview` del frontend ofrece un recorrido rápido por los módulos clave de EduCore. Desde la pantalla de inicio de sesión encontrarás un enlace **“Ver cómo funciona EduCore”** que te dirige a esta vista. En ella se resumen:

- **Panel central** con navegación lateral, notificaciones y avatar dinámico por usuario.
- **Gestión académica** (calificaciones, asistencia, inscripciones y reportes) con herramientas específicas para docentes y estudiantes.
- **Módulo financiero** para registrar pagos, consultar estados de cuenta y generar reportes de caja.
- **Alertas e incidencias** para dar seguimiento a eventos relevantes en la comunidad educativa.

Utiliza esta vista como documentación visual de alto nivel antes de crear usuarios o cargar datos reales.

## Estructura del repositorio

```
EduCoreProyectF/
├── backend/            # API NestJS + TypeORM + Swagger
├── frontend/           # Aplicación React + Vite
├── docker-compose.yml  # Ejemplo de servicio SQL Server
├── package.json        # Scripts utilitarios a nivel raíz
└── README.md           # Esta guía
```

## Siguientes pasos sugeridos

- Configura pipelines de CI/CD que ejecuten `npm run lint` y pruebas automatizadas.
- Implementa un mecanismo de seed de datos para ambientes locales.
- Añade documentación adicional para despliegues en la nube (env vars y servicios administrados).

¡Listo! Con estos pasos podrás instalar, configurar y ejecutar EduCore en tu equipo local.
