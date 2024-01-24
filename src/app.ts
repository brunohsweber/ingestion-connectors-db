import 'dotenv/config';
import 'reflect-metadata';

import '@shared/container';
import { container } from 'tsyringe';

import { IngestionModule } from '@modules/ingestion';
import { LoggerService } from '@shared/services/LoggerService';
import { LevelType } from '@shared/services/LoggerService/enum/LevelType';
import { finishWithException } from '@shared/utils/finishWithException';
import to from '@shared/utils/to';

class App {
  private loggerService: LoggerService;

  constructor() {
    this.loggerService = container.resolve(LoggerService);
  }

  async run() {
    this.loggerService.trace({
      level: LevelType.Debug,
      message: `App is running...`,
    });

    const [error] = await to(container.resolve(IngestionModule).run());

    if (error) {
      finishWithException(error);
    }

    this.loggerService.trace({
      level: LevelType.Debug,
      message: `App finished with success!`,
    });

    process.exit(0);
  }
}

const app = container.resolve(App);

export { app };
