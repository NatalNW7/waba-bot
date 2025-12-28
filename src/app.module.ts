import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WabaModule } from './waba/waba.module';

@Module({
  imports: [WabaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
