import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { Contact } from '../../domain/entities/contact.entity';
import { ContactGroup } from '../../domain/entities/contact-group.entity';
import { Group } from '../../domain/entities/group.entity';
import { SummaryContactView } from '../../domain/views/summary-contact.view';
import { SummaryGroupView } from '../../domain/views/summary-group.view';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot()],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        namingStrategy: new SnakeNamingStrategy(),
        synchronize: true,
        dropSchema: false,
        logging: false,
        entities: [
          Contact,
          ContactGroup,
          Group,
          SummaryContactView,
          SummaryGroupView,
        ],
        timezone: 'UTC',
      }),
    }),
  ],
})
export class DatabaseModule {}
