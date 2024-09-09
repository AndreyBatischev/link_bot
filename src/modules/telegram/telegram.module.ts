import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { LinksModule } from '../links/links.module';
import { TelegramService } from './telegram.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        token: configService.get<string>('TG_TOKEN'),
      }),
    }),
    LinksModule,
  ],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
