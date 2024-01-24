import { container } from 'tsyringe';

import { ILoggerProvider } from './LoggerProvider/ILoggerProvider';
import { ProcessStdoutWriteProvider } from './LoggerProvider/implementations/ProcessStdoutWriteProvider';

container.registerSingleton<ILoggerProvider>(
  'LoggerProvider',
  ProcessStdoutWriteProvider,
);
