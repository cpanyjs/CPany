import type { Verdict } from './enum';
import type { IAuthor } from './handle';
import type { IProblem } from './problem';

export interface ISubmission {
  type: string;
  id: number;
  creationTime: number;
  language: string;
  verdict: Verdict;
  author: IAuthor;
  problem: IProblem;
  submissionUrl?: string;
}
