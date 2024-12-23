import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule.forRoot(), AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
