import { Body, Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { DataSource, getManager } from "typeorm";
import { UuidGeneratorHelper } from "./ussd/utils/uuid-generator.helper";


@Controller()
export class AppController {

}
