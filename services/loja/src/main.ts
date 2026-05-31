import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "Athlos — Loja API",
  description: "Microsserviço de produtos e catálogo da loja.",
  port: process.env.PORT,
});