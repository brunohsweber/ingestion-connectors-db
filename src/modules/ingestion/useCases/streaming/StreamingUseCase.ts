import { Transform, pipeline } from 'stream';
import { container, inject, injectable } from 'tsyringe';
import { promisify } from 'util';

import { ISourceRepository } from '@modules/ingestion/repositories/ISourceRepository';
import { ITargetRepository } from '@modules/ingestion/repositories/ITargetRepository';
import { LoggerService } from '@shared/services/LoggerService';
import { LevelType } from '@shared/services/LoggerService/enum/LevelType';

@injectable()
class StreamingUseCase {
  private loggerService: LoggerService;

  constructor(
    @inject('SourceRepository') private sourceRepository: ISourceRepository,
    @inject('TargetRepository') private targetRepository: ITargetRepository,
  ) {
    this.loggerService = container.resolve(LoggerService);
  }

  async execute(totalRecords: number) {
    const readStream = await this.sourceRepository.queryStream();

    let extractedRecords = 0;

    const transformStream = new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        this.push(JSON.stringify(chunk));

        extractedRecords += 1;

        callback();
      },
    });

    const writeStream = await this.targetRepository.writeStream();

    const pipelineAsync = promisify(pipeline);

    this.loggerService.trace({
      level: LevelType.Debug,
      message: `Data extraction started...`,
    });

    await pipelineAsync(readStream, transformStream, writeStream);

    const totalIngested = await this.targetRepository.getTotalIngested();

    if (extractedRecords < totalRecords || totalIngested < totalRecords) {
      this.loggerService.trace({
        level: LevelType.Warning,
        message: `Alert for discrepancy in records!`,
        metadata: {
          totalRecords,
          extractedRecords,
          totalIngested,
        },
      });
    }

    this.loggerService.trace({
      level: LevelType.Debug,
      message: `Data extraction finished successfully!`,
    });
  }
}

export { StreamingUseCase };
