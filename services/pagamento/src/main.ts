import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "Athlos — Pagamento API",
  description: "Microsserviço de pagamentos da plataforma Athlos.",
  port: process.env.PORT,
});