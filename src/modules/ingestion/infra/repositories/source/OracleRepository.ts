import Joi from 'joi';
import oracledb from 'oracledb';
import { Readable } from 'stream';

import { ISourceRepository } from '@modules/ingestion/repositories/ISourceRepository';

class OracleRepository implements ISourceRepository {
  private connection: oracledb.Connection | null;

  constructor() {
    this.connection = null;
  }

  getSchema(): Joi.Schema {
    return Joi.object({
      ORACLE_CONNECTION_STRING: Joi.string().required(),
      ORACLE_USER: Joi.string().required(),
      ORACLE_PASSWORD: Joi.string().required(),
      ORACLE_QUERY: Joi.string().required(),
    });
  }

  private async connect(): Promise<this> {
    // Oracle DB connection details
    const dbConfig = {
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING,
    };

    this.connection = await oracledb.getConnection(dbConfig);

    return this;
  }

  async disconnect(): Promise<void> {
    await this.connection!.close();
  }

  async totalCount(): Promise<number> {
    if (!this.connection) {
      await this.connect();
    }

    const result = await this.connection!.execute(
      `SELECT COUNT(*) AS total FROM (${process.env.ORACLE_QUERY!}) sub`,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalRows = (result.rows as any[][])[0][0] || 0;

    return totalRows;
  }

  async queryStream(): Promise<Readable> {
    if (!this.connection) {
      await this.connect();
    }

    // Execute the query and obtain a resultSet
    const result = await this.connection!.execute(
      process.env.ORACLE_QUERY!,
      [],
      {
        resultSet: true,
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    const { resultSet } = result;

    // Convert resultSet to a readable stream
    const queryStream = resultSet!.toQueryStream();

    return queryStream;
  }
}

export { OracleRepository };
