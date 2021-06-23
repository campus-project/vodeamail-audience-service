import { Module, Provider } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

const providers: Provider[] = [];

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
  providers: [...providers],
  exports: [...providers],
})
export class InfrastructureModule {}
