import { Module, Provider } from '@nestjs/common';
import { RabbitMQMananger } from './rabbit-mq-manager';
import { BullMqManager } from './bull-mq-manager';

const TOKEN = 'RABBIT_MQ';

const bullProviders: Provider[] = [
  {
    provide: 'BULL_CONNECTION',
    useValue: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
  },
  {
    provide: 'BULL_MQ',
    useFactory: (connection) => new BullMqManager(connection),
    inject: ['BULL_CONNECTION'],
  },
];

@Module({
  providers: [
    ...bullProviders,
    { provide: 'RABBIT_MQ', useClass: RabbitMQMananger },
  ],
  exports: ['RABBIT_MQ','BULL_MQ'],
})
export class RabbitMQModule { }