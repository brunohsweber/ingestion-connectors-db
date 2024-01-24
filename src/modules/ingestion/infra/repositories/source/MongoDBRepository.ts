/* eslint-disable no-underscore-dangle */
import Joi from 'joi';
import { Collection, MongoClient, ObjectId } from 'mongodb';
import { Readable } from 'stream';

import { ISourceRepository } from '@modules/ingestion/repositories/ISourceRepository';

class MongoDBRepository implements ISourceRepository {
  private client: MongoClient | null;
  private repository: Collection | null;

  constructor() {
    this.client = null;
    this.repository = null;
  }
  getSchema(): Joi.Schema {
    return Joi.object({
      MONGODB_CONNECTION_STRING: Joi.string().required(),
      MONGODB_COLLECTION: Joi.string().required(),
      MONGODB_QUERY: Joi.string().required(),
    });
  }

  private async connect(): Promise<this> {
    this.client = new MongoClient(process.env.MONGODB_CONNECTION_STRING!, {
      socketTimeoutMS: 120000,
      connectTimeoutMS: 120000,
    });

    this.repository = this.client!.db().collection(
      process.env.MONGODB_COLLECTION!,
    );

    return this;
  }

  async disconnect(): Promise<void> {
    await this.client!.close();
  }

  async totalCount(): Promise<number> {
    if (!this.client) {
      await this.connect();
    }

    // Parse da string de consulta da variável de ambiente
    const query = JSON.parse(process.env.MONGODB_QUERY!);

    // Converte para ObjectId se necessário
    if (query._id && typeof query._id === 'string') {
      query._id = new ObjectId(query._id);
    }

    const count = this.repository!.countDocuments(query);

    return count;
  }

  async queryStream(): Promise<Readable> {
    if (!this.client) {
      await this.connect();
    }

    // Parse da string de consulta da variável de ambiente
    const query = JSON.parse(process.env.MONGODB_QUERY!);

    // Converte para ObjectId se necessário
    if (query._id && typeof query._id === 'string') {
      query._id = new ObjectId(query._id);
    }

    const stream = this.repository!.find(query, {
      noCursorTimeout: false,
    })
      .batchSize(2600)
      .stream();

    return stream;
  }
}

export { MongoDBRepository };
