import Joi from 'joi';
import { Transform } from 'stream';

import { ISourceRepository } from '../ISourceRepository';

class SourceRepositoryInMemory implements ISourceRepository {
  getSchema(): Joi.Schema {
    throw new Error('Method not implemented.');
  }
  disconnect(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  totalCount(): Promise<number> {
    throw new Error('Method not implemented.');
  }
  async queryStream(): Promise<Transform> {
    throw new Error('Method not implemented.');
  }
}

export { SourceRepositoryInMemory };
