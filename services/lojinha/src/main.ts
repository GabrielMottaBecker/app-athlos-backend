import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "Athlos — Lojinha API",
  description: "Microsserviço de loja de Atléticas Universitárias.",
  port: process.env.PORT,
});
