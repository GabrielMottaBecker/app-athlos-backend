"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SharedMessagingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedMessagingService = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_service_1 = require("./rabbitmq.service");
let SharedMessagingService = SharedMessagingService_1 = class SharedMessagingService {
    constructor(rabbitMQService) {
        this.rabbitMQService = rabbitMQService;
        this.logger = new common_1.Logger(SharedMessagingService_1.name);
    }
    async assertExchange(name, type = "direct") {
        const channel = this.rabbitMQService.getChannel();
        await channel.assertExchange(name, type, { durable: true });
    }
    async publish(exchangeName, routingKey, payload) {
        const channel = this.rabbitMQService.getChannel();
        channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(payload)), {
            persistent: true,
            contentType: "application/json",
        });
        this.logger.log(`Mensagem publicada no exchange "${exchangeName}" com routing key "${routingKey}"`);
    }
};
exports.SharedMessagingService = SharedMessagingService;
exports.SharedMessagingService = SharedMessagingService = SharedMessagingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_service_1.RabbitMQService])
], SharedMessagingService);
//# sourceMappingURL=shared-messaging.service.js.map