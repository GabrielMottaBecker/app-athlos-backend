import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "Athlos — Associação API",
  description: "Microsserviço de gestão de associados de Atléticas Universitárias.",
  port: process.env.PORT,
});
