import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { UserModule } from './modules/User/user.module';
import { PersonModule } from './modules/Person/person.module';
import { StudentModule } from './modules/students/student.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            sortSchema: true,
            playground: true,
            introspection: true,
            buildSchemaOptions: {
                dateScalarMode: 'timestamp',
            },
        }),

        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT ?? '5432', 10),
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '12345678',
            database: process.env.DB_NAME || 'educore',
            autoLoadEntities: true,
            synchronize: true, // solo en desarrollo
        }),

        UserModule,
        PersonModule,
        StudentModule,
    ],
})
export class AppModule {}
