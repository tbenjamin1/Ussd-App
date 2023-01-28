import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle("ussd app v1")
    .setDescription("ussd app v1")
    .setVersion("1.0")
    .addTag("ussd app v1")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/", app, document);
  await app.listen(process.env.NODE_PORT || 3000);
}
bootstrap();
