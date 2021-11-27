import type { Logger } from './logger';
import { random, sleep } from './utils';

type TaskFn = () => Promise<boolean>;

interface ITask {
  id: string;
  fn: TaskFn;
}

export function createRetryContainer(logger: Logger, maxRetry: number = 10) {
  const tasks: ITask[] = [];

  const add = (id: string, fn: TaskFn) => {
    tasks.push({ id, fn });
  };

  const run = async () => {
    for (const task of tasks) {
      let stop = false;
      for (let count = 1; count <= maxRetry; count++) {
        const ok = await task.fn();
        if (!ok) {
          if (count === maxRetry) {
            stop = true;
            logger.error(`Error: Task ${task.id} failed`);
            break;
          }
          const suffix = count % 10 === 1 ? 'st' : count % 10 === 2 ? 'nd' : 'th';
          logger.info(`Retry: Task ${task.id} failed at the ${count}-${suffix} time`);
          await sleep(random(2 * 1000, 5 * 1000));
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
