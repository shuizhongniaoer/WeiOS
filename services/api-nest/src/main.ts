import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = process.env.WEIOS_ALLOWED_ORIGINS?.split(",") ?? [
    "http://localhost:3000",
  ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = Number(process.env.WEIOS_API_PORT ?? 3100);
  await app.listen(port);
}

void bootstrap();
