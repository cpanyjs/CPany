type LogFn = (message: string) => void;

export type IContext = Record<string, string>;

export interface ILogger {
  debug: LogFn;
  info: LogFn;
  warning: LogFn;
  error: LogFn;
}
