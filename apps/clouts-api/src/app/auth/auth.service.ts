import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import crypto from 'crypto';
import dayjs from 'dayjs';
import { RegisterRequest } from 'models';
import { WrongCredentialsError } from '../common/errors/login';
import {
  CreatingUserError,
  EmailAlreadyTakenError,
  UsernameAlreadyTakenError,
} from '../common/errors/register';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly secret: string;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {
    this.secret = this.config.get<string>('AUTH_SECRET');
    if (!this.secret) {
      throw new Error('AUTH_SECRET not set');
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new WrongCredentialsError();
    }

    const passwordValid = await compare(password, user.password);
    if (!passwordValid) {
      throw new WrongCredentialsError();
    }

    const sessionData = {
      createdAt: new Date(),
      expiresAt: dayjs().add(30, 'day').toDate(),
      userId: user.id,
    };

    const sessionHash = crypto
      .createHmac('sha256', this.secret)
      .update(JSON.stringify(sessionData))
      .digest('base64url');

    try {
      await this.prisma.session.create({
        data: {
          expiresAt: sessionData.expiresAt,
          createdAt: sessionData.createdAt,
          session: sessionHash,
          userId: user.id,
        },
      });
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException('Error creating session');
    }

    return sessionHash;
  }

  async register(data: RegisterRequest) {
    try {
      const passwordHash = await hash(data.password, 12);
      await this.prisma.user.create({
        data: {
          email: data.email,
          username: data.username,
          password: passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
        },
      });
    } catch (e) {
      if (e.code === 'P2002') {
        if (e.meta.target.includes('email')) {
          throw new EmailAlreadyTakenError();
        } else if (e.meta.target.includes('username')) {
          throw new UsernameAlreadyTakenError();
        }
      }
      this.logger.error(e);
      throw new CreatingUserError();
    }
  }
}
