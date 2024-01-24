import Joi from 'joi';
import { Writable } from 'stream';

import * as grpc from '@grpc/grpc-js';
import { ITargetRepository } from '@modules/ingestion/repositories/ITargetRepository';
import client from '@shared/config/gRPC/client';

class GRPCRepository implements ITargetRepository {
  constructor() {}

  getSchema(): Joi.Schema {
    throw new Error('Method not implemented.');
  }

  async writeStream(): Promise<Writable> {
    const metadata = new grpc.Metadata();

    metadata.add('metadata', '123');

    return client.stream(metadata);
  }

  getTotalIngested(): Promise<number> {
    throw new Error('Method not implemented.');
  }
}

export { GRPCRepository };
