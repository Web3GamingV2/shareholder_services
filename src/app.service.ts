import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {
    console.log('AppService constructor');
    console.log(this.config.get('PORT'));
  }

  getHello(): string {
    return 'Hello World! 1111111111';
  }
}
