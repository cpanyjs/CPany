import { Random, MersenneTwister19937 } from 'random-js';

import type { ILogger } from './utils';

const random = new Random(MersenneTwister19937.autoSeed());

type TaskFn = () => Promise<boolean>;

interface ITask {
  id: string;
  fn: TaskFn;
}

export function createRetryContainer(logger: ILogger, maxRetry: number = 10) {
  const tasks: ITask[] = [];

  const add = (id: string, fn: TaskFn) => {
    tasks.push({ id, fn });
  };

  const run = async () => {
    for (const task of tasks) {
      let stop = false;
      for (let count = 0; count < maxRetry; count++) {
        const ok = await task.fn();
        if (!ok) {
          await sleep(random.integer(2 * 1000, 5 * 1000));
          if (count === maxRetry) {
            stop = true;
            logger.error(`Task ${task.id} run fail`);
          }
        } else {
          break;
        }
      }
      if (stop) break;
    }
  };

  return {
    add,
    run
  };
}

export function sleep(duration: number): Promise<void> {
  return new Promise((res) => setTimeout(() => res(), duration));
}
