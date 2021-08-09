type LogFn = (message: string) => void;

export type IContext = Record<string, string>;

export interface ILogger {
  log: LogFn;
  info: LogFn;
  error: LogFn;
}
