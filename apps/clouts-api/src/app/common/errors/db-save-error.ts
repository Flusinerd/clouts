import { InternalServerErrorException } from '@nestjs/common';

export class DbSaveError extends InternalServerErrorException {
  constructor() {
    super('Error saving the changes');
  }
}
