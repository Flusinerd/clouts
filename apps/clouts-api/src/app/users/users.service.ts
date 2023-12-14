import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateUserRequest } from 'models';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User doesn't exist or has blocked you");
    }

    return user;
  }

  async updateUser(id: string, data: UpdateUserRequest) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException("User doesn't exist");
        }

        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }

        throw new InternalServerErrorException('Error updating user');
      }
    }
  }
}
