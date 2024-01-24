import { ILoggerProvider } from '../ILoggerProvider';

class ProcessStdoutWriteProvider implements ILoggerProvider {
  trace({
    timestamp,
    level,
    message,
    metadata,
  }: {
    timestamp: Date;
    level: string;
    message: string;
    metadata: string;
  }) {
    const trace = JSON.stringify({
      timestamp,
      level,
      message,
      metadata,
    });

    process.stdout.write(`${trace}\n`);
  }
}

export { ProcessStdoutWriteProvider };
