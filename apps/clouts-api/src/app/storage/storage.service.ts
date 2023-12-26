import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient } from '@azure/storage-blob';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const POSTS_IMAGES_CONTAINER = 'posts-images';
const POSTS_VIDEOS_CONTAINER = 'posts-videos';
const POSTS_AUDIO_CONTAINER = 'posts-audio';
const POSTS_FILES_CONTAINER = 'posts-files';
const PROFILES_CONTAINER = 'profiles';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly serviceClient: BlobServiceClient;

  constructor(readonly config: ConfigService) {
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
  ) {
    this.logger.debug(
      `Uploading file ${filePath} to container ${containerName}`,
    );

    const containerClient =
      this.serviceClient.getContainerClient(containerName);

    const blobName = filePath.split('/').pop();

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

  public uploadProfileImage(
    userId: string,
    filePath: string,
    contentType: string,
  ) {
    return this.uploadFile(PROFILES_CONTAINER, filePath, contentType, {
      userId,
    });
  }
}
