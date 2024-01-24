import '@shared/container/providers';
import { container } from 'tsyringe';

import { CockroachDBRepository } from '@modules/ingestion/infra/repositories/source/CockroachDBRepository';
import { MariaDBRepository } from '@modules/ingestion/infra/repositories/source/MariaDBRepository';
import { MongoDBRepository } from '@modules/ingestion/infra/repositories/source/MongoDBRepository';
import { MySQLRepository } from '@modules/ingestion/infra/repositories/source/MySQLRepository';
import { OracleRepository } from '@modules/ingestion/infra/repositories/source/OracleRepository';
import { PostgreSQLRepository } from '@modules/ingestion/infra/repositories/source/PostgreSQLRepository';
import { SQLServerRepository } from '@modules/ingestion/infra/repositories/source/SQLServerRepository';
import { ISourceRepository } from '@modules/ingestion/repositories/ISourceRepository';
import { ITargetRepository } from '@modules/ingestion/repositories/ITargetRepository';
import { AppError } from '@shared/errors/AppError';
import { LoggerService } from '@shared/services/LoggerService';
import { finishWithException } from '@shared/utils/finishWithException';

try {
  const environment = process.env.ENVIRONMENT;

  container.registerSingleton(LoggerService);

  type SourceRepositoryType = {
    [key: string]: { new (): ISourceRepository };
  };

  const sourceRepositories: SourceRepositoryType = {
    MariaDB: MariaDBRepository,
    PostgreSQL: PostgreSQLRepository,
    SQLServer: SQLServerRepository,
    Oracle: OracleRepository,
    MySQL: MySQLRepository,
    CockroachDB: CockroachDBRepository,
    MongoDB: MongoDBRepository,
  };

  const connectionType = process.env
    .CONNECTION_TYPE as keyof SourceRepositoryType;

  const sourceRepository = sourceRepositories[connectionType];

  if (!sourceRepository) {
    throw new AppError(
      `Supported Connection Types: ${JSON.stringify(
        Object.keys(sourceRepositories),
      )}`,
    );
  }

  container.registerSingleton<ISourceRepository>(
    'SourceRepository',
    sourceRepository,
  );

  if (environment === 'test') {
    import('@modules/ingestion/repositories/in-memory/TargetRepositoryInMemory')
      .then(({ TargetRepositoryInMemory }) => {
        container.registerSingleton<ITargetRepository>(
          'TargetRepository',
          TargetRepositoryInMemory,
        );
      })
      .catch((error) => {
        throw error;
      });
  } else if (environment === 'local') {
    import(
      '@modules/ingestion/infra/repositories/target/LocalStorageRepository'
    )
      .then(({ LocalStorageRepository }) => {
        container.registerSingleton<ITargetRepository>(
          'TargetRepository',
          LocalStorageRepository,
        );
      })
      .catch((error) => {
        throw error;
      });
  } else {
    const target = process.env.TARGET as string;

    if (target === 'DataLakeSemantix') {
      import(
        '@modules/ingestion/infra/repositories/target/DataLakeSemantixRepository'
      )
        .then(({ DataLakeSemantixRepository }) => {
          container.registerSingleton<ITargetRepository>(
            'TargetRepository',
            DataLakeSemantixRepository,
          );
        })
        .catch((error) => {
          throw error;
        });
    } else if (target === 'gRPC') {
      import('@modules/ingestion/infra/repositories/target/GRPCRepository')
        .then(({ GRPCRepository }) => {
          container.registerSingleton<ITargetRepository>(
            'TargetRepository',
            GRPCRepository,
          );
        })
        .catch((error) => {
          throw error;
        });
    } else {
      throw new AppError(
        `Supported Target: ${JSON.stringify(['DataLakeSemantix', 'gRPC'])}`,
      );
    }
  }
} catch (error) {
  finishWithException(error);
}
