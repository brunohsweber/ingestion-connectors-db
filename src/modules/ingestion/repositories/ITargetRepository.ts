import Joi from 'joi';
import { Writable } from 'stream';

interface ITargetRepository {
  getSchema(): Joi.Schema;
  writeStream(): Promise<Writable>;
  getTotalIngested(): Promise<number>;
}

export { ITargetRepository };
