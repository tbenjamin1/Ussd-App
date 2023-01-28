import { Injectable } from "@nestjs/common";

const {
  v4: uuidv4,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("uuid");

@Injectable()
export class UuidGeneratorHelper {
  generateUUID() {
    return uuidv4();
  }
}
