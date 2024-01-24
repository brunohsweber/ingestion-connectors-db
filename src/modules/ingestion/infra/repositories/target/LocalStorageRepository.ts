import { existsSync, mkdirSync, createWriteStream } from 'fs';
import Joi from 'joi';
import path from 'path';
import { Writable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

import { ITargetRepository } from '@modules/ingestion/repositories/ITargetRepository';
import { AppError } from '@shared/errors/AppError';

class LocalStorageRepository implements ITargetRepository {
  getTotalIngested(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  private batchesNumber: number = 0;
  private destinationURI: string | null = null;

  getSchema(): Joi.Schema {
    return Joi.object({
      OUTPUT_PATH: Joi.string().required(),
    });
  }

  async writeStream(): Promise<Writable> {
    this.batchesNumber += 1;

    this.destinationURI = `${process.env.OUTPUT_PATH}_${uuidv4()}.json`;
    const regex = /[^/]+\.[^/.]+$/;
    const match = this.destinationURI.match(regex);

    if (!match) {
      throw new AppError('Invalid file name in destinationURI!');
    }

    const fileName = match[0];
    const dir = `temp/${this.destinationURI.replace(/.*:\/\//, '')}`;
    const dirWithoutFileName = path.join(dir, '..');

    if (!existsSync(dirWithoutFileName)) {
      mkdirSync(dirWithoutFileName, { recursive: true });
    }

    const filePath = path.join(dirWithoutFileName, fileName);

    return createWriteStream(filePath, { flags: 'a' });
  }
}

export { LocalStorageRepository };
