import Joi from 'joi';
import knex, { Knex } from 'knex';
import { Transform } from 'stream';

import { ISourceRepository } from '@modules/ingestion/repositories/ISourceRepository';

class MySQLRepository implements ISourceRepository {
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
      MYSQL_CONNECTION_STRING: Joi.string().allow(null, '').optional(),
      MYSQL_HOST: bypassHelper('MYSQL_CONNECTION_STRING'),
      MYSQL_PORT: bypassHelper('MYSQL_CONNECTION_STRING'),
      MYSQL_USER: bypassHelper('MYSQL_CONNECTION_STRING'),
      MYSQL_PASSWORD: bypassHelper('MYSQL_CONNECTION_STRING'),
      MYSQL_DATABASE: bypassHelper('MYSQL_CONNECTION_STRING'),
      MYSQL_QUERY: Joi.string().required(),
    });
  }

  private async connect(): Promise<this> {
    this.client = knex({
      client: 'mysql2',
      connection: process.env.MYSQL_CONNECTION_STRING || {
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
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
      `SELECT COUNT(*) AS total FROM (${process.env.MYSQL_QUERY!}) as sub`,
    );

    const totalRows = Number(queryResult[0][0].total);

    return totalRows;
  }

  async queryStream(): Promise<Transform> {
    if (!this.client) {
      await this.connect();
    }

    const stream = this.client!.raw(process.env.MYSQL_QUERY!).stream();

    return stream;
  }
}

export { MySQLRepository };
