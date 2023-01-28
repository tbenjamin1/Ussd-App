import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseConnectionService } from "./ussd/config/db";
import { UssdController } from "./ussd/controllers/ussd.controller";
import { UssdService } from "./ussd/services/ussd.service";
import { ConfigModule } from "@nestjs/config";
import { UuidGeneratorHelper } from "./ussd/utils/uuid-generator.helper";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConnectionService,
    }),
  ],
  controllers: [AppController, UssdController],
  providers: [
    AppService,
    UssdService,
    UuidGeneratorHelper,
  ],
})
export class AppModule {}
