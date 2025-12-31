import { Module } from '@nestjs/common';
import { AxiosClient } from './axios-client';

@Module({
  providers: [AxiosClient],
  exports: [AxiosClient],
})
export class HttpModule {}