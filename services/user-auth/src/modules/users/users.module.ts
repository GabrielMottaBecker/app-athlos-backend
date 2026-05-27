import { Module } from "@nestjs/common";
import { UserService } from "@users/application/services/user.service";
import { USER_REPOSITORY } from "@users/domain/repositories/user-repository.interface";
import { UsersController } from "@users/infra/controllers/users.controller";
import { DrizzleUserRepository } from "@users/infra/repositories/drizzle-user.repository";

@Module({
  controllers: [UsersController],
  providers: [
    UserService,
    DrizzleUserRepository,
    {
      provide: USER_REPOSITORY,
      useExisting: DrizzleUserRepository,
    },
  ],
  exports: [UserService],
})
export class UsersModule {}