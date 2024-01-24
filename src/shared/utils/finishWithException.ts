import { container } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';
import { LoggerService } from '@shared/services/LoggerService';
import { LevelType } from '@shared/services/LoggerService/enum/LevelType';

const finishWithException = (error: unknown) => {
  const loggerService = container.resolve(LoggerService);

  loggerService.trace({
    level: LevelType.Debug,
    message: `App finished with exception!`,
    metadata: {
      error: error instanceof AppError ? error.message : String(error),
    },
  });

  console.error(error);

  process.exit(1);
};

export { finishWithException };
