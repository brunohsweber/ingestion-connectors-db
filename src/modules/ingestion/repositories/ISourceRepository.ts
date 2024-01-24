import Joi from 'joi';
import { Readable, Transform } from 'stream';

interface ISourceRepository {
  getSchema(): Joi.Schema;
  totalCount(): Promise<number>;
  queryStream(): Promise<Readable | Transform>;
  disconnect(): Promise<void>;
}

export { ISourceRepository };
