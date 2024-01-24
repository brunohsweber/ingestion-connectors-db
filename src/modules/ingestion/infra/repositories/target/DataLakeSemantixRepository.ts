/* eslint-disable no-await-in-loop */
/* eslint-disable no-useless-catch */
import axios from 'axios';
import Joi from 'joi';
import retry from 'retry';
import { Writable } from 'stream';
import { container } from 'tsyringe';
import { v4 as uuidv4 } from 'uuid';

import { ITargetRepository } from '@modules/ingestion/repositories/ITargetRepository';
import { AppError } from '@shared/errors/AppError';
import { LoggerService } from '@shared/services/LoggerService';
import { LevelType } from '@shared/services/LoggerService/enum/LevelType';

class DataLakeSemantixRepository implements ITargetRepository {
  private loggerService: LoggerService = container.resolve(LoggerService);
  private buffer: Buffer[] = [];
  private MAX_BYTES_PER_FILE: number = process.env.MAX_BYTES_PER_FILE
    ? Number(process.env.MAX_BYTES_PER_FILE)
    : 200 * 1024 * 1024; // 200 MiB;
  private totalChunks: number = 0;
  private totalBytes: number = 0;
  private bufferBytes: number = 0;
  private chunks: number = 0;
  private signedUploadURL: string | null = null;
  private batchesNumber: number = 0;
  private requests: number = 0;
  private destinationURI: string | null = null;

  private async getSignedUploadURL(destinationURI: string): Promise<string> {
    const baseURL =
      process.env.ENVIRONMENT === 'development'
        ? 'https://api-broker.app.horizoncore.io'
        : 'https://api-broker.semantix.ai';

    const url = `${baseURL}/storage/signed_upload_url?destination_uri=${destinationURI}&method=RESUMABLE`;

    return new Promise((resolve, reject) => {
      const operation = retry.operation({
        retries: 4, // = 5
        factor: 2,
        minTimeout: 5000,
      });

      operation.attempt(async (currentAttempt: number) => {
        try {
          this.loggerService.trace({
            level: LevelType.Debug,
            message: `Attempt ${currentAttempt}: Requesting signed upload URL in API Broker...`,
            metadata: {
              destinationURI,
            },
          });

          const response = await axios.get(url, {
            timeout: 5000,
          });

          if (response.data.statusCode === 200) {
            const signedURL = response.data.data as string;

            this.loggerService.trace({
              level: LevelType.Debug,
              message: `Attempt ${currentAttempt}: Obtained signed upload URL.`,
              metadata: {
                details: {
                  signedURL,
                },
              },
            });

            resolve(signedURL);
          } else {
            const errorMessage = `Ingestion not allowed!`;

            this.loggerService.trace({
              level: LevelType.Debug,
              message: errorMessage,
              metadata: {
                details: {
                  requestedURL: url,
                  response: response.data.message,
                },
              },
            });

            reject(new AppError(errorMessage));
          }
        } catch (error) {
          const errorDetails = error.response
            ? error.response.data
            : error.message;

          this.loggerService.trace({
            level: LevelType.Warning,
            message: `Attempt ${currentAttempt}: Request failed.`,
            metadata: {
              errorDetails,
            },
          });

          if (operation.retry(error)) {
            this.loggerService.trace({
              level: LevelType.Info,
              message: `Retrying to get signed upload URL in few moments...`,
            });
          } else {
            this.loggerService.trace({
              level: LevelType.Warning,
              message: `Failed after ${currentAttempt} attempts to get signed upload URL.`,
              metadata: {
                errorDetails,
              },
            });

            reject(
              operation.mainError() ||
                new AppError(
                  'Failed to obtain signed upload URL after multiple attempts.',
                ),
            );
          }
        }
      });
    });
  }

  getSchema(): Joi.Schema {
    return Joi.object({
      OUTPUT_PATH: Joi.string().required(),
    });
  }

  private resetBuffer() {
    this.buffer = [];
    this.bufferBytes = 0;
    this.chunks = 0;
  }

  private async uploadBuffer() {
    try {
      this.batchesNumber += 1;
      this.requests += 1;

      const buffer = Buffer.concat(this.buffer);

      this.loggerService.trace({
        level: LevelType.Debug,
        message: 'Generated ingestion batch',
        metadata: {
          batch: this.batchesNumber,
          records: this.chunks,
          bytes: buffer.byteLength,
        },
      });

      this.destinationURI = `${process.env.OUTPUT_PATH}_${uuidv4()}_${
        this.batchesNumber
      }.json`;

      this.signedUploadURL = await this.getSignedUploadURL(this.destinationURI);

      await new Promise<void>((resolve, reject) => {
        const operation = retry.operation({
          retries: 4, // = 5
          factor: 2,
          minTimeout: 5000,
        });

        operation.attempt(async (currentAttempt: number) => {
          try {
            this.loggerService.trace({
              level: LevelType.Debug,
              message: `Attempt ${currentAttempt}: Uploading ingestion batch...`,
            });

            const response = await axios.put(this.signedUploadURL!, buffer);

            if (response.status === 200) {
              this.loggerService.trace({
                level: LevelType.Debug,
                message: `Attempt ${currentAttempt}: Ingestion batch uploaded successfully!`,
                metadata: {
                  response: response.data,
                },
              });

              this.resetBuffer();

              resolve();
            } else {
              this.loggerService.trace({
                level: LevelType.Debug,
                message: 'Ingestion batch failed to upload!',
                metadata: {
                  response,
                },
              });

              throw new AppError(
                `Failed to upload ingestion batch: ${response.status} - ${response.statusText}`,
              );
            }
          } catch (error) {
            const errorDetails = error.response
              ? error.response.data
              : error.message;

            this.loggerService.trace({
              level: LevelType.Warning,
              message: `Attempt ${currentAttempt}: Request failed.`,
              metadata: {
                errorDetails,
              },
            });

            if (operation.retry(error)) {
              this.loggerService.trace({
                level: LevelType.Info,
                message: `Retrying to upload ingestion batch in few moments...`,
              });
            } else {
              this.loggerService.trace({
                level: LevelType.Warning,
                message: `Failed after ${currentAttempt} attempts to upload ingestion batch.`,
                metadata: {
                  errorDetails,
                },
              });

              reject(
                operation.mainError() ||
                  new AppError('Failed to upload ingestion batch.'),
              );
            }
          }
        });
      });
    } catch (error) {
      throw error;
    }
  }

  async writeStream(): Promise<Writable> {
    return new Writable({
      write: async (chunk, encoding, callback) => {
        try {
          this.buffer.push(
            Buffer.concat([
              !this.buffer.length ? Buffer.from('[') : Buffer.from(','),
              chunk,
            ]),
          );

          const chunkLength = chunk.length;

          this.totalChunks += 1;
          this.totalBytes += chunkLength;

          this.chunks += 1;
          this.bufferBytes += chunkLength;

          if (this.bufferBytes >= this.MAX_BYTES_PER_FILE) {
            this.buffer.push(Buffer.from(']'));
            await this.uploadBuffer();
          }

          callback(null);
        } catch (error) {
          callback(error);
        }
      },
      final: async (callback) => {
        try {
          if (this.bufferBytes > 0) {
            this.buffer.push(Buffer.from(']'));
            await this.uploadBuffer();
          }

          callback(null);
        } catch (error) {
          callback(error);
        }
      },
    });
  }

  async getTotalIngested(): Promise<number> {
    return this.totalChunks;
  }
}

export { DataLakeSemantixRepository };
