import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import { ImagesService } from '../images/images.service';

const POSTS_IMAGES_CONTAINER = 'posts-images' as const;
const POSTS_VIDEOS_CONTAINER = 'posts-videos' as const;
const POSTS_AUDIO_CONTAINER = 'posts-audio' as const;
const POSTS_FILES_CONTAINER = 'posts-files' as const;
const PROFILES_CONTAINER = 'profiles' as const;
const BANNERS_CONTAINER = 'banners' as const;

type PROFILE_IMAGE_TYPES = typeof PROFILES_CONTAINER | typeof BANNERS_CONTAINER;

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly serviceClient: BlobServiceClient;

  constructor(
    readonly config: ConfigService,
    readonly imagesService: ImagesService,
  ) {
    const accountName = config.get('AZURE_STORAGE_ACCOUNT_NAME');
    if (!accountName) {
      throw new Error('AZURE_STORAGE_ACCOUNT_NAME not set');
    }

    this.serviceClient = new BlobServiceClient(
      `https://${accountName}.blob.core.windows.net`,
      new DefaultAzureCredential(),
    );

    this.init()
      .then(() => this.logger.verbose('Initialized storage service'))
      .catch((err) => this.logger.error(err));
  }

  private async init() {
    return await Promise.all([this.initContainers()]);
  }

  private initContainers() {
    return Promise.all([
      this.upsertContainer(POSTS_IMAGES_CONTAINER),
      this.upsertContainer(POSTS_VIDEOS_CONTAINER),
      this.upsertContainer(POSTS_AUDIO_CONTAINER),
      this.upsertContainer(POSTS_FILES_CONTAINER),
      this.upsertContainer(PROFILES_CONTAINER),
      this.upsertContainer(BANNERS_CONTAINER),
    ]);
  }

  private async upsertContainer(name: string) {
    const containerClient = this.serviceClient.getContainerClient(name);
    const exists = await containerClient.exists();
    if (!exists) {
      await containerClient.create();
      this.logger.verbose(`Created azure blob container ${name}`);
    } else {
      this.logger.verbose(`Azure blob container ${name} already exists`);
    }
  }

  private async uploadFile(
    containerName: string,
    filePath: string,
    contentType: string,
    metadata?: Record<string, string>,
    blobName?: string,
  ) {
    this.logger.debug(
      `Uploading file ${filePath} to container ${containerName}`,
    );

    const containerClient =
      this.serviceClient.getContainerClient(containerName);

    if (!blobName) {
      filePath.split('/').pop();
    }

    if (!blobName) {
      throw new Error('Invalid file path');
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    try {
      const uploadResult = await blockBlobClient.uploadFile(filePath, {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
        metadata: {
          ...metadata,
          uploadedBy: 'clouts-api',
        },
      });

      this.logger.verbose(
        `Uploaded file ${filePath} to container ${containerName}`,
      );

      return uploadResult;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  private async uploadBlob(
    containerName: string,
    blobName: string,
    buffer: Buffer,
    contentType: string,
    metadata?: Record<string, string>,
  ) {
    this.logger.debug(
      `Uploading blob ${blobName} to container ${containerName}`,
    );
    const containerClient =
      this.serviceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    try {
      const uploadResult = await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
        metadata: {
          ...metadata,
          uploadedBy: 'clouts-api',
        },
      });
      this.logger.verbose(
        `Uploaded blob ${blobName} to container ${containerName}`,
      );

      return uploadResult;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  private async getBlobStream(
    containerName: string,
    blobName: string,
  ): Promise<NodeJS.ReadableStream> {
    const containerClient =
      this.serviceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const downloadResponse = await blockBlobClient.download();

    const stream = downloadResponse.readableStreamBody;

    if (!stream) {
      throw new Error('Blob not found');
    }

    return stream;
  }

  public async getProfilePictureStream(userId: string) {
    return this.getBlobStream(PROFILES_CONTAINER, `${userId}.jpg`);
  }

  public async getProfilePictureThumbnailStream(userId: string) {
    return this.getBlobStream(PROFILES_CONTAINER, `${userId}-thumbnail.jpg`);
  }

  public async getProfilePictureBlurredStream(userId: string) {
    return this.getBlobStream(PROFILES_CONTAINER, `${userId}-blurred.jpg`);
  }

  public async getBannerPictureStream(userId: string) {
    return this.getBlobStream(BANNERS_CONTAINER, `${userId}.jpg`);
  }

  public async getBannerPictureBlurredStream(userId: string) {
    return this.getBlobStream(BANNERS_CONTAINER, `${userId}-blurred.jpg`);
  }

  public async uploadProfileImage(
    userId: string,
    filePath: string,
    contentType: string,
  ) {
    let profilePicturePaths: [string, string, string] | undefined = undefined;
    try {
      const [originalFile, thumbnail] =
        await this.imagesService.generateProfileImage(filePath);
      const blurredFilePath = await this.imagesService.blurImage(
        thumbnail,
        `${userId}-blurred.jpg`,
      );
      profilePicturePaths = [originalFile, thumbnail, blurredFilePath];
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException(
        'Error processing the profile image',
      );
    }

    if (!profilePicturePaths) {
      throw new InternalServerErrorException(
        'Error processing the profile image',
      );
    }

    const [originalFilePath, thumbnailFilePath, blurredFilePath] =
      profilePicturePaths;

    const fileExtension = path.extname(originalFilePath);

    // Upload both files in parallel
    try {
      await Promise.all([
        this.uploadFile(
          PROFILES_CONTAINER,
          originalFilePath,
          contentType,
          {
            userId,
          },
          `${userId}${fileExtension}`,
        ),
        this.uploadFile(
          PROFILES_CONTAINER,
          thumbnailFilePath,
          contentType,
          {
            userId,
          },
          `${userId}-thumbnail${fileExtension}`,
        ),
        this.uploadFile(
          PROFILES_CONTAINER,
          blurredFilePath,
          contentType,
          {
            userId,
          },
          `${userId}-blurred${fileExtension}`,
        ),
      ]);
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error uploading profile image');
    }
  }

  public async uploadBannerImage(
    userId: string,
    filePath: string,
    contentType: string,
  ) {
    try {
      const bannerImagePath =
        await this.imagesService.generateBannerImage(filePath);
      const fileExtension = path.extname(bannerImagePath);
      const blurredFilePath = await this.imagesService.blurImage(
        bannerImagePath,
        `${userId}-blurred.jpg`,
      );

      // Upload both files in parallel
      await Promise.all([
        this.uploadFile(
          BANNERS_CONTAINER,
          bannerImagePath,
          contentType,
          {
            userId,
          },
          `${userId}${fileExtension}`,
        ),
        this.uploadFile(
          BANNERS_CONTAINER,
          blurredFilePath,
          contentType,
          {
            userId,
          },
          `${userId}-blurred${fileExtension}`,
        ),
      ]);

      return [bannerImagePath, blurredFilePath];
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error uploading banner image');
    }
  }
}
