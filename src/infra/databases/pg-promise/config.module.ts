import { Global, Module } from '@nestjs/common';
import { getConnection, ReplicType } from './connection';

const TOKEN = 'DATABASE_CONNECTION';

@Global()
@Module({
  providers: [
    {
      provide: TOKEN,
      useFactory: () => {
        return (replic: ReplicType = ReplicType.MASTER) => getConnection(replic);
      },
    },
  ],
  exports: [TOKEN],
})
export class DatabaseModule {}
