import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { Contact } from '../../domain/entities/contact.entity';
import { ContactGroup } from '../../domain/entities/contact-group.entity';
import { Group } from '../../domain/entities/group.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST') || '127.0.0.1',
        port: configService.get<number>('DB_PORT') || 3306,
        username: configService.get<string>('DB_USERNAME') || 'root',
        password: configService.get<string>('DB_PASSWORD') || 'secret',
        database:
          configService.get<string>('DB_DATABASE') ||
          'vodeamail-audience-service',
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: true,
        dropSchema: false,
        logging: false,
        entities: [Contact, ContactGroup, Group],
        timezone: 'UTC',
      }),
    }),
  ],
})
export class DatabaseModule {}
