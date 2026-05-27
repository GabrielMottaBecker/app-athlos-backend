import { RabbitMQService } from "./rabbitmq.service";
export declare class SharedMessagingService {
    private readonly rabbitMQService;
    private readonly logger;
    constructor(rabbitMQService: RabbitMQService);
    assertExchange(name: string, type?: string): Promise<void>;
    publish(exchangeName: string, routingKey: string, payload: unknown): Promise<void>;
}
