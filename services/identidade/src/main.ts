import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "Athlos — Identidade API",
  description: "Microsserviço de autenticação e gestão de usuários de Atléticas Universitárias.",
  port: process.env.PORT,
});
