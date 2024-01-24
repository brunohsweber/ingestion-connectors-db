import Joi from 'joi';
import { Writable } from 'stream';

import { ITargetRepository } from '../ITargetRepository';

class TargetRepositoryInMemory implements ITargetRepository {
  getTotalIngested(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  getSchema(): Joi.Schema {
    throw new Error('Method not implemented.');
  }
  writeStream(): Promise<Writable> {
    throw new Error('Method not implemented.');
  }
}

export { TargetRepositoryInMemory };
