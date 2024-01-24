import { LevelType } from '../enum/LevelType';

interface ITraceDTO {
  level: LevelType;
  message: string;
  metadata?: unknown;
}

export { ITraceDTO };
