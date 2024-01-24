import { container } from 'tsyringe';

import { LoggerService } from '@shared/services/LoggerService';
import { LevelType } from '@shared/services/LoggerService/enum/LevelType';

import { ValidateTargetParametrizationUseCase } from './ValidateTargetParametrizationUseCase';

class ValidateTargetParametrizationController {
  private loggerService: LoggerService;

  constructor() {
    this.loggerService = container.resolve(LoggerService);
  }

  async handle(): Promise<void> {
    this.loggerService.trace({
      level: LevelType.Debug,
      message: 'Validating target parameters...',
    });

    const useCase = container.resolve(ValidateTargetParametrizationUseCase);

    await useCase.execute();

    this.loggerService.trace({
      level: LevelType.Debug,
      message: 'Target parametrization validated successfully!',
      metadata: {
        target: process.env.TARGET,
      },
    });
  }
}

export { ValidateTargetParametrizationController };
