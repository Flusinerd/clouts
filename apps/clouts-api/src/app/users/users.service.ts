import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateUserRequest } from 'models';
import { FileSystemStoredFile } from 'nestjs-form-data';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

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
    let profilePictureUrl: string | undefined;

    if (data.profilePicture) {
      try {
        const file = data.profilePicture as FileSystemStoredFile;
        const uploadResult = await this.storage.uploadProfileImage(
          id,
          file.path,
          file.mimeType,
        );

        console.log(uploadResult);
      } catch (error) {
        this.logger.error(error);
        throw new InternalServerErrorException(
          "Error uploading user's profile picture",
        );
      }
    }

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
