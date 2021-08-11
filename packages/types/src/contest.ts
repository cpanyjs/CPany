import type { IAuthor } from './handle';
import type { IContestProblem } from './problem';

export interface IContest {
  type: string;
  name: string;
  startTime: number;
  duration: number;
  id?: number | string;
  phase?: string;
  contestUrl?: string;
  standingsUrl?: string;
  problems?: IContestProblem[];
  standings?: IContestStanding[];
}

export interface IContestSubmission {
  type: string;
  id: number;
  creationTime: number;
  relativeTime: number;
  language: string;
  problem: number;
  submissionUrl?: string;
}

export interface IContestStanding {
  author: IAuthor;
  rank: number;
  solved: number;
  penalty: number;
  submissions: IContestSubmission[];
}
