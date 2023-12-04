import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

export class UsernameAlreadyTakenError extends ConflictException {
  constructor() {
    super('Username already taken');
  }
}

export class EmailAlreadyTakenError extends ConflictException {
  constructor() {
    super('Email already taken');
  }
}

export class CreatingUserError extends InternalServerErrorException {
  constructor() {
    super('Something went wrong while creating the user');
  }
}
