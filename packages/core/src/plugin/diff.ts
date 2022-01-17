import type { IContest, ISubmission } from '@cpany/types';
import type { BasicPlugin } from './types';

export interface DiffContext {
  addHandleSubmission(name: string, ...submissions: ISubmission[]): void;

  addHandleContest(name: string, ...contests: IContest[]): void;

  addContest(...contests: IContest[]): void;
}

export interface DiffPlugin extends BasicPlugin {
  diff: (context: DiffContext) => Promise<void>;
}
