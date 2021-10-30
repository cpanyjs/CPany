type LogFn = (message: string) => void;

export type LogLevel = 'warn' | 'error' | 'silent';

export type IContext = Record<string, string>;

export interface ILogger {
  debug: LogFn;
  info: LogFn;
  warning: LogFn;
  error: LogFn;
  startGroup: (name: string) => void;
  endGroup: () => void;
}

export function createDefaultLogger(): ILogger {
  let prefixCount = 0;

  const prefix = () => '  '.repeat(prefixCount);
  const addPrefix = (message: string) =>
    message
      .split('\n')
      .map((message) => prefix() + message)
      .join('\n');

  return {
    debug(message) {
      console.debug(addPrefix(message));
    },
    info(message) {
      console.info(addPrefix(message));
    },
    warning(message) {
      console.warn(addPrefix(message));
    },
    error(message) {
      console.error(addPrefix(message));
    },
    startGroup(name) {
      console.log(`${prefix()}Start Group ${name}:`);
      prefixCount++;
    },
    endGroup() {
      console.log('');
      prefixCount--;
    }
  };
}

export function createPrefixLogger(prefix: string, logger: ILogger, logLevel: LogLevel): ILogger {
  return {
    debug(message) {
      return logger.debug(prefix + ' ' + message);
    },
    info(message) {
      return logger.info(prefix + ' ' + message);
    },
    warning(message) {
      if (logLevel === 'warn') {
        return logger.warning(prefix + ' ' + message);
      }
    },
    error(message) {
      if (logLevel === 'warn' || logLevel === 'error') {
        return logger.error(prefix + ' ' + message);
      }
    },
    startGroup(name) {
      return logger.startGroup(name);
    },
    endGroup() {
      return logger.endGroup();
    }
  };
}
