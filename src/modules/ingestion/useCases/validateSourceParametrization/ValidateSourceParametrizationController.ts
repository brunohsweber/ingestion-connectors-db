import { container } from 'tsyringe';

import { LoggerService } from '@shared/services/LoggerService';
import { LevelType } from '@shared/services/LoggerService/enum/LevelType';

import { ValidateSourceParametrizationUseCase } from './ValidateSourceParametrizationUseCase';

class ValidateSourceParametrizationController {
  private loggerService: LoggerService;

  constructor() {
    this.loggerService = container.resolve(LoggerService);
  }

  async handle(): Promise<void> {
    this.loggerService.trace({
      level: LevelType.Debug,
      message: 'Validating source parameters...',
    });

    const useCase = container.resolve(ValidateSourceParametrizationUseCase);

    await useCase.execute();

    this.loggerService.trace({
      level: LevelType.Debug,
      message: 'Source parametrization validated successfully!',
      metadata: {
        source: process.env.CONNECTION_TYPE,
      },
    });
  }
}

export { ValidateSourceParametrizationController };
