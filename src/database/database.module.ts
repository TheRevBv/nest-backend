import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({})
export class DatabaseModule {
  public static forRoot() {
    return MongooseModule.forRoot(process.env.MONGO_URI);
  }
}
