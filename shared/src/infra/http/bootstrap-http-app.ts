import { ValidationPipe, type Type } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { join } from "path";

type BootstrapHttpAppOptions = {
  title: string;
  description: string;
  version?: string;
  globalPrefix?: string;
  port?: number | string;
  /**
   * Diretório local (relativo ao cwd do processo) que será servido como
   * arquivos estáticos. Útil para servir uploads (ex.: foto de perfil).
   * Fica disponível em /<staticAssets.urlPrefix>/<arquivo>.
   */
  staticAssets?: {
    rootPath: string;
    urlPrefix: string;
  };
};

export async function bootstrapHttpApp(
  rootModule: Type<unknown>,
  options: BootstrapHttpAppOptions,
): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(rootModule);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  if (options.staticAssets) {
    app.useStaticAssets(join(process.cwd(), options.staticAssets.rootPath), {
      prefix: options.staticAssets.urlPrefix,
    });
  }

  app.setGlobalPrefix(options.globalPrefix ?? "v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const documentConfig = new DocumentBuilder()
    .setTitle(options.title)
    .setDescription(options.description)
    .setVersion(options.version ?? "1.0.0")
    .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" })
    .build();

  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup("docs", app, document);

  await app.listen(options.port ?? process.env.PORT ?? 3000);
}