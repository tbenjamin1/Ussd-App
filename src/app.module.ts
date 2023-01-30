import { CacheModule, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseConnectionService } from "./ussd/config/db";
import { UssdController } from "./ussd/controllers/ussd.controller";
import { UssdService } from "./ussd/services/ussd.service";
import { ConfigModule } from "@nestjs/config";
import { UuidGeneratorHelper } from "./ussd/utils/uuid-generator.helper";
import { UssdRequest } from "./ussd/entities/ussd.request.entity";
import { DataSource } from "typeorm";
import { ValidatorHelper } from "./ussd/helper/validator.helper";

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register(),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DB,
      entities: [UssdRequest],
      synchronize: true,
    }),
  ],
  controllers: [AppController, UssdController],
  providers: [
    AppService,
    UssdService,
    ValidatorHelper,
    UuidGeneratorHelper,
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
