import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqplib from "amqplib";
import type { Channel, ChannelModel } from "amqplib";

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection?: ChannelModel;
  private channel?: Channel;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const url = this.configService.get<string>("RABBITMQ_URL");

    if (!url) {
      this.logger.warn("RABBITMQ_URL não configurado; RabbitMQ desabilitado.");
      return;
    }

    this.connection = await amqplib.connect(url);
    this.channel = await this.connection.createChannel();
    this.logger.log("Conexão com RabbitMQ estabelecida");
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  getChannel(): Channel {
    if (!this.channel) {
      throw new Error("Canal RabbitMQ não inicializado");
    }
    return this.channel;
  }

  async createChannel(): Promise<Channel> {
    if (!this.connection) {
      throw new Error("Conexão RabbitMQ não inicializada");
    }
    return this.connection.createChannel();
  }
}
