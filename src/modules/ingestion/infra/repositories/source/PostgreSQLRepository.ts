import Joi from 'joi';
import knex, { Knex } from 'knex';
import { Transform } from 'stream';

import { ISourceRepository } from '@modules/ingestion/repositories/ISourceRepository';

class PostgreSQLRepository implements ISourceRepository {
  private client: Knex | null;

  constructor() {
    this.client = null;
  }
  getSchema(): Joi.Schema {
    const bypassHelper = (key: string): Joi.StringSchema<string> => {
      return Joi.string()
        .allow(null, '')
        .optional()
        .when(key, {
          is: Joi.valid(null, ''),
          then: Joi.required(),
        });
    };

    return Joi.object({
      POSTGRESQL_CONNECTION_STRING: Joi.string().allow(null, '').optional(),
      POSTGRESQL_HOST: bypassHelper('POSTGRESQL_CONNECTION_STRING'),
      POSTGRESQL_PORT: bypassHelper('POSTGRESQL_CONNECTION_STRING'),
      POSTGRESQL_USER: bypassHelper('POSTGRESQL_CONNECTION_STRING'),
      POSTGRESQL_PASSWORD: bypassHelper('POSTGRESQL_CONNECTION_STRING'),
      POSTGRESQL_DATABASE: bypassHelper('POSTGRESQL_CONNECTION_STRING'),
      POSTGRESQL_QUERY: Joi.string().required(),
    });
  }

  private async connect(): Promise<this> {
    this.client = knex({
      client: 'pg',
      connection: process.env.POSTGRESQL_CONNECTION_STRING || {
        host: process.env.POSTGRESQL_HOST,
        port: Number(process.env.POSTGRESQL_PORT),
        user: process.env.POSTGRESQL_USER,
        password: process.env.POSTGRESQL_PASSWORD,
        database: process.env.POSTGRESQL_DATABASE,
        ssl:
          process.env.SSL_ENABLED === 'true'
            ? {
                rejectUnauthorized: true,
                ca: process.env.SSL_CA,
                key: process.env.SSL_KEY,
                cert: process.env.SSL_CERT,
              }
            : false,
        pool: {
          min: 2,
          max: 10,
        },
      },
    }) as Knex;

    return this;
  }

  async disconnect(): Promise<void> {
    await this.client!.destroy();
  }

  async totalCount(): Promise<number> {
    if (!this.client) {
      await this.connect();
    }

    const queryResult = await this.client!.raw(
      `SELECT COUNT(*) AS total FROM (${process.env.POSTGRESQL_QUERY!}) as sub`,
    );

    const totalRows = Number(queryResult.rows[0].total);

    return totalRows;
  }

  async queryStream(): Promise<Transform> {
    if (!this.client) {
      await this.connect();
    }

    const stream = this.client!.raw(process.env.POSTGRESQL_QUERY!).stream();

    return stream;
  }
}

export { PostgreSQLRepository };
