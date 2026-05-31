import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "Athlos — Financeiro API",
  description: "Microsserviço de controle financeiro de Atléticas Universitárias.",
  port: process.env.PORT,
});
