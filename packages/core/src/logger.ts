import {
  black,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  gray,
  lightGray,
  lightRed,
  lightGreen,
  lightYellow,
  lightBlue,
  lightMagenta,
  lightCyan,
  bold
} from 'kolorist';
import { shuffle } from './utils';

type LogFn = (message: string) => void;

export type LogLevel = 'warn' | 'error' | 'silent';

export interface Logger {
  debug: LogFn;
  info: LogFn;
  warning: LogFn;
  error: LogFn;
  startGroup: (name: string) => void;
  endGroup: () => void;
}

export interface ExtendLogger {
  debug: LogFn;
  info: LogFn;
  warning: LogFn;
  error: LogFn;
  startGroup: (name: string) => void;
  endGroup: () => void;
  setLevel: (logLevel: LogLevel) => void;
}

export function createLogger(
  option?: { logLevel?: LogLevel; context?: string },
  logger?: Logger
): ExtendLogger {
  let logLevel = option?.logLevel ?? 'warn';

  const context = option?.context;

  const prefix = () => {
    if (!!context) {
      return `${context} `;
    } else {
      return '';
    }
  };

  const addPrefix = (message: string) =>
    message
      .replace(/\r?\n/g, '\n')
      .split('\n')
      .map((message) => prefix() + message)
      .join('\n');

  return {
    setLevel(_logLevel: LogLevel) {
      logLevel = _logLevel;
    },
    debug(message) {
      if (logger) {
        logger.debug(addPrefix(message));
      } else {
        console.debug(addPrefix(message));
      }
    },
    info(message) {
      if (logger) {
        logger.info(addPrefix(message));
      } else {
        console.info(addPrefix(message));
      }
    },
    warning(message) {
      if (logLevel === 'warn') {
        if (logger) {
          logger.warning('\n' + addPrefix(message));
        } else {
          console.warn(addPrefix(message));
        }
      }
    },
    error(message) {
      if (logLevel === 'warn' || logLevel === 'error') {
        if (logger) {
          // new line for github actions
          logger.error('\n' + addPrefix(message));
        } else {
          console.error(addPrefix(message));
        }
      }
    },
    startGroup(name) {
      if (logger) {
        logger.startGroup(name);
      } else {
        console.log(black(bold(`--- ${name} ---`)));
      }
    },
    endGroup() {
      if (logger) {
        logger.endGroup();
      } else {
        console.log('');
      }
    }
  };
}

const colorList = shuffle([
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  gray,
  lightGray,
  lightRed,
  lightGreen,
  lightYellow,
  lightBlue,
  lightMagenta,
  lightCyan
]);

export function createLoggerFactory(contexts: string[], logLevel?: LogLevel, logger?: Logger) {
  const maxLength = contexts.reduce((len, ctx) => Math.max(len, ctx.length), 0);
  const loggers = new Map(
    contexts.map((context, index) => [
      context,
      createLogger(
        {
          logLevel,
          context:
            colorList[index % colorList.length](bold(context)) +
            ' '.repeat(maxLength - context.length)
        },
        logger
      )
    ])
  );
  return (context: string) => {
    if (loggers.has(context)) {
      return loggers.get(context)!;
    } else {
      return createLogger(
        { logLevel, context: bold(context) + ' '.repeat(Math.max(0, maxLength - context.length)) },
        logger
      );
    }
  };
}
