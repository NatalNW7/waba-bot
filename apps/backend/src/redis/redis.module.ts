import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const redisUrl = new URL(config.get<string>('REDIS_URL')!);
        const useTls = redisUrl.protocol === 'rediss:';

        return {
          redis: {
            host: redisUrl.hostname,
            port: parseInt(redisUrl.port),
            password: redisUrl.password
              ? decodeURIComponent(redisUrl.password)
              : undefined,
            username:
              redisUrl.username && redisUrl.username !== 'default'
                ? decodeURIComponent(redisUrl.username)
                : undefined,
            tls: useTls ? {} : undefined,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class RedisModule {}
