import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle("ishema ussd v3")
    .setDescription("The ishema ussd v1")
    .setVersion("1.0")
    .addTag("The ishema ussd v13")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/", app, document);
  await app.listen(process.env.NODE_PORT || 3000);
}
bootstrap();
