import { bootstrapHttpApp } from "@shared/infra/http/bootstrap-http-app";
import { AppModule } from "./app.module";

void bootstrapHttpApp(AppModule, {
  title: "Athlos - Feed API",
  description: "Microsservico de eventos e treinos de Atleticas Universitarias.",
  port: process.env.PORT,
});
