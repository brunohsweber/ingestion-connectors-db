import { injectable, inject } from 'tsyringe';

import { ILoggerProvider } from '@shared/container/providers/LoggerProvider/ILoggerProvider';

import { ITraceDTO } from './dtos/ITraceDTO';

@injectable()
class LoggerService {
  constructor(@inject('LoggerProvider') private provider: ILoggerProvider) {}

  public trace({ ...params }: ITraceDTO) {
    this.provider.trace({
      timestamp: new Date(),
      level: params.level,
      message: `${params.message}`,
      metadata: JSON.stringify(params.metadata),
    });
  }
}

export { LoggerService };
