import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { StorageService } from './storage.service';

@Controller('files')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get(':container/:filename')
  async getFile(
    @Param('container') container: string,
    @Param('filename') filename: string,
    @Query('thumb') thumb: boolean,
    @Res() res: Response,
  ) {
    if (container === 'profiles') {
      let stream: NodeJS.ReadableStream;

      if (thumb) {
        stream =
          await this.storageService.getProfilePictureThumbnailStream(filename);
      } else {
        stream = await this.storageService.getProfilePictureStream(filename);
      }

      stream.pipe(res);
    }

    if (container === 'banners') {
      const stream = await this.storageService.getBannerPictureStream(filename);
      stream.pipe(res);
    }
  }
}
