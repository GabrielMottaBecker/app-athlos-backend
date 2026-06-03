import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "Athlos - Notificacoes API",
  description: "Microsservico de notificacoes do Athlos.",
  port: process.env.PORT,
});
