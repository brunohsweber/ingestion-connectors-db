import { container, inject, injectable } from 'tsyringe';

import { ISourceRepository } from '@modules/ingestion/repositories/ISourceRepository';
import { AppError } from '@shared/errors/AppError';
import { LoggerService } from '@shared/services/LoggerService';
import { LevelType } from '@shared/services/LoggerService/enum/LevelType';

@injectable()
class GetTotalRecordsUseCase {
  private loggerService: LoggerService;

  constructor(
    @inject('SourceRepository') private sourceRepository: ISourceRepository,
  ) {
    this.loggerService = container.resolve(LoggerService);
  }

  async execute() {
    this.loggerService.trace({
      level: LevelType.Debug,
      message: `Getting the total count of records...`,
    });

    const totalRecords = await this.sourceRepository.totalCount();

    this.loggerService.trace({
      level: LevelType.Debug,
      message: `Obtained the total count of records!`,
      metadata: {
        total: totalRecords || 0,
      },
    });

    if (!totalRecords || totalRecords === 0) {
      throw new AppError('No data for ingestion!');
    }

    return totalRecords;
  }
}

export { GetTotalRecordsUseCase };
