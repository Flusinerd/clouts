import { UnauthorizedException } from '@nestjs/common';

export class WrongCredentialsError extends UnauthorizedException {
  constructor() {
    super('Wrong credentials');
  }
}
