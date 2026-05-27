import { AuthRpcService } from "./infra/auth/auth-rpc.service";
import { Global, Module } from "@nestjs/common";
import { SharedAuthModule } from "./infra/auth/shared-auth.module";
import { DrizzleService } from "./infra/database/drizzle.service";
import { RabbitMQService } from "./infra/messaging/rabbitmq.service";
import { SharedMessagingService } from "./infra/messaging/shared-messaging.service";

@Global()
@Module({
  imports: [SharedAuthModule],
  providers: [DrizzleService, RabbitMQService, SharedMessagingService, AuthRpcService],
  exports: [SharedAuthModule, DrizzleService, RabbitMQService, SharedMessagingService, AuthRpcService],
})
export class SharedModule {}
