"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapHttpApp = bootstrapHttpApp;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
async function bootstrapHttpApp(rootModule, options) {
    const app = await core_1.NestFactory.create(rootModule);
    app.setGlobalPrefix(options.globalPrefix ?? "v1");
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const documentConfig = new swagger_1.DocumentBuilder()
        .setTitle(options.title)
        .setDescription(options.description)
        .setVersion(options.version ?? "1.0.0")
        .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" })
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, documentConfig);
    swagger_1.SwaggerModule.setup("docs", app, document);
    await app.listen(options.port ?? process.env.PORT ?? 3000);
}
//# sourceMappingURL=bootstrap-http-app.js.map