import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { convert, execute, resize, thumbnail } from 'easyimage';
import * as path from 'path';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  // Generates a profile picture
  public async generateProfileImage(originalFilePath: string) {
    try {
      this.logger.debug(`Generating profile image for ${originalFilePath}`);

      const newFileName = crypto.randomUUID().toString() + '.jpg';
      const newFilePath = path.join(
        path.dirname(originalFilePath),
        newFileName,
      );

      await convert({
        src: originalFilePath,
        dst: newFilePath,
      });

      await resize({
        src: newFilePath,
        dst: newFilePath,
        width: 2048,
        onlyDownscale: true,
      });

      const thumbnailPath = path.join(
        path.dirname(newFilePath),
        newFileName.replace('.jpg', '-thumbnail.jpg'),
      );

      await thumbnail({
        src: newFilePath,
        dst: thumbnailPath,
        width: 150,
        height: 150,
        gravity: 'center',
      });

      this.logger.debug(`Generated profile image at ${newFilePath}`);

      return [newFilePath, thumbnailPath];
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error processing the image');
    }
  }

  public async generateBannerImage(originalFilePath: string) {
    try {
      this.logger.debug(`Generating banner image for ${originalFilePath}`);

      const newFileName = crypto.randomUUID().toString() + '.jpg';
      const newFilePath = path.join(
        path.dirname(originalFilePath),
        newFileName,
      );

      await convert({
        src: originalFilePath,
        dst: newFilePath,
      });

      await resize({
        src: newFilePath,
        dst: newFilePath,
        width: 2048,
        onlyDownscale: true,
      });

      this.logger.debug(`Generated banner image at ${newFilePath}`);

      return newFilePath;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error processing the image');
    }
  }

  public async blurImage(originalFilePath: string, newFileName?: string) {
    this.logger.debug(`Blurring image at ${originalFilePath}`);

    const extension = path.extname(originalFilePath);

    const newFilePath = path.join(
      path.dirname(originalFilePath),
      newFileName ?? crypto.randomUUID().toString() + extension,
    );

    try {
      await execute('convert', [
        originalFilePath,
        '-filter',
        'Gaussian',
        '-blur',
        '0x8',
        newFilePath,
      ]);

      this.logger.debug(`Blurred image at ${newFilePath}`);

      return newFilePath;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error processing the image');
    }
  }
}
