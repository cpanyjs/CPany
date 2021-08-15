import * as core from '@actions/core';
import { Random, MersenneTwister19937 } from 'random-js';
import { sleep } from './utils';

const random = new Random(MersenneTwister19937.autoSeed());

type TaskFn = () => Promise<boolean>;

interface ITask {
  id: string;
  fn: TaskFn;
  count: number;
}

export function createRetryContainer(maxRetry: number = 10) {
  const tasks: ITask[] = [];

  const add = (id: string, fn: TaskFn) => {
    tasks.push({ id, fn, count: 0 });
  };

  const run = async () => {
    while (tasks.length > 0) {
      const newTasks: ITask[] = [];
      for (const { id, fn, count } of tasks) {
        const ok = await fn();
        if (!ok) {
          if (count === maxRetry) {
            core.error(`Task ${id} run fail`);
          } else {
            newTasks.push({ id, fn, count: count + 1 });
          }
        }
      }
      tasks.splice(0);
      tasks.push(...newTasks);
      await sleep(random.integer(10, 60));
    }
  };

  return {
    add,
    run
  };
}
