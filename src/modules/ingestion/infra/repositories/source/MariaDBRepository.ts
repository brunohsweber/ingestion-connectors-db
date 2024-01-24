import Joi from 'joi';
import knex, { Knex } from 'knex';
import { Transform } from 'stream';

import { ISourceRepository } from '@modules/ingestion/repositories/ISourceRepository';

class MariaDBRepository implements ISourceRepository {
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
      MARIADB_CONNECTION_STRING: Joi.string().allow(null, '').optional(),
      MARIADB_HOST: bypassHelper('MARIADB_CONNECTION_STRING'),
      MARIADB_PORT: bypassHelper('MARIADB_CONNECTION_STRING'),
      MARIADB_USER: bypassHelper('MARIADB_CONNECTION_STRING'),
      MARIADB_PASSWORD: bypassHelper('MARIADB_CONNECTION_STRING'),
      MARIADB_DATABASE: bypassHelper('MARIADB_CONNECTION_STRING'),
      MARIADB_QUERY: Joi.string().required(),
    });
  }

  private async connect(): Promise<this> {
    this.client = knex({
      client: 'mysql2',
      connection: process.env.MARIADB_CONNECTION_STRING || {
        host: process.env.MARIADB_HOST,
        port: Number(process.env.MARIADB_PORT),
        user: process.env.MARIADB_USER,
        password: process.env.MARIADB_PASSWORD,
        database: process.env.MARIADB_DATABASE,
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
      `SELECT COUNT(*) AS total FROM (${process.env.MARIADB_QUERY!}) as sub`,
    );

    const totalRows = Number(queryResult[0][0].total);

    return totalRows;
  }

  async queryStream(): Promise<Transform> {
    if (!this.client) {
      await this.connect();
    }

    const stream = this.client!.raw(process.env.MARIADB_QUERY!).stream();

    return stream;
  }
}

export { MariaDBRepository };
