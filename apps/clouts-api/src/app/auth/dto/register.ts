import { RegisterRequest } from 'models';
import { createZodDto } from 'nestjs-zod';

export class RegisterRequestDto extends createZodDto(RegisterRequest) {}
