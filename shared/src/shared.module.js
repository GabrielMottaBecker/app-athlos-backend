"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedModule = void 0;
const common_1 = require("@nestjs/common");
const shared_auth_module_1 = require("./infra/auth/shared-auth.module");
const drizzle_service_1 = require("./infra/database/drizzle.service");
const rabbitmq_service_1 = require("./infra/messaging/rabbitmq.service");
const shared_messaging_service_1 = require("./infra/messaging/shared-messaging.service");
let SharedModule = class SharedModule {
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [shared_auth_module_1.SharedAuthModule],
        providers: [drizzle_service_1.DrizzleService, rabbitmq_service_1.RabbitMQService, shared_messaging_service_1.SharedMessagingService],
        exports: [shared_auth_module_1.SharedAuthModule, drizzle_service_1.DrizzleService, rabbitmq_service_1.RabbitMQService, shared_messaging_service_1.SharedMessagingService],
    })
], SharedModule);
//# sourceMappingURL=shared.module.js.map