import Joi from 'joi';
import knex, { Knex } from 'knex';
import { Transform } from 'stream';

import { ISourceRepository } from '@modules/ingestion/repositories/ISourceRepository';

class CockroachDBRepository implements ISourceRepository {
  private client: Knex | null;

  constructor() {
    this.client = null;
  }
  getSchema(): Joi.Schema {
    return Joi.object({
      COCKROACHDB_CONNECTION_STRING: Joi.string().required(),
      COCKROACHDB_QUERY: Joi.string().required(),
    });
  }

  private async connect(): Promise<this> {
    this.client = knex({
      client: 'mssql',
      connection: process.env.SQLSERVER_CONNECTION_STRING || {
        server: process.env.SQLSERVER_SERVER,
        port: Number(process.env.SQLSERVER_PORT),
        user: process.env.SQLSERVER_USER,
        password: process.env.SQLSERVER_PASSWORD,
        database: process.env.SQLSERVER_DATABASE,
        options: {
          encrypt: true, // Use essa opção se estiver usando criptografia SSL
          trustServerCertificate: true,
        },
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
      `SELECT COUNT(*) AS total FROM (${process.env
        .COCKROACHDB_QUERY!}) as sub`,
    );

    const totalRows = Number(queryResult.rows[0].total);

    return totalRows;
  }

  async queryStream(): Promise<Transform> {
    if (!this.client) {
      await this.connect();
    }

    const stream = this.client!.raw(process.env.COCKROACHDB_QUERY!).stream();

    return stream;
  }
}

export { CockroachDBRepository };
