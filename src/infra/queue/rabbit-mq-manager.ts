import amqp, { Channel, Connection, Options, Message } from 'amqplib';

type Type = 'direct' | 'topic' | 'headers' | 'fanout'

export class RabbitMQMananger {

  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private readonly url: string;

  constructor() {
    this.url = process.env.RABBITMQ_URL || 'amqp://localhost';
  }

  async connect(): Promise<void> {
    try {
      if (!this.connection) {
        this.connection = await amqp.connect(this.url);
      }
      if (!this.channel) {
        this.channel = await this.connection.createChannel();
      }
    } catch (error) {
      throw error;
    }
  }

  async assertExchange(
    exchangeName: string,
    type: Type = 'direct',
    options: Options.AssertExchange = { durable: true }
  ): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ: Canal não inicializado.');
    try {
      await this.channel.assertExchange(exchangeName, type, options);
    } catch (error) {
      throw error;
    }
  }

  async assertQueue(
    queueName: string,
    exchangeName: string,
    routingKey: string,
    queueOptions: Options.AssertQueue = { durable: true },
    bindingOptions: Record<string, unknown> = {}
  ): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ: Canal não inicializado.');
    try {
      await this.channel.assertQueue(queueName, queueOptions);

      await this.channel.bindQueue(queueName, exchangeName, routingKey, bindingOptions);
    } catch (error) {
      throw error;
    }
  }

  async publish(
    exchangeName: string,
    routingKey: string,
    message: string,
    options: Options.Publish = { persistent: true }
  ): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ: Canal não inicializado.');
    try {
      this.channel.publish(exchangeName, routingKey, Buffer.from(message), options);
    } catch (error) {
      throw error;
    }
  }

  async consume(
    queueName: string,
    onMessage: (message: string) => void,
    consumeOptions: Options.Consume = {}
  ): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ: Canal não inicializado.');
    try {
      await this.channel.consume(queueName, (msg: Message | null) => {
        if (msg) {
          const content = msg.content.toString();
          onMessage(content);
          this.channel!.ack(msg);
        }
      }, consumeOptions);
    } catch (error) {
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      throw error;
    }
  }
}