interface ILoggerProvider {
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
  }): void;
}

export { ILoggerProvider };
