type LogFn = (message: string) => void;

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

  return {
    debug(message) {
      console.debug(prefix() + message);
    },
    info(message) {
      console.info(prefix() + message);
    },
    warning(message) {
      console.warn(prefix() + message);
    },
    error(message) {
      console.error(message);
    },
    startGroup(name) {
      console.log(`${prefix()}Start group ${name}:`);
      prefixCount++;
    },
    endGroup() {
      console.log('');
      prefixCount--;
    }
  };
}
