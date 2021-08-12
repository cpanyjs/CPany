export interface IProblem {
  type: string;
  id: number | string;
  name: string;
  problemUrl?: string;
  rating?: number;
  tags?: string[];
}

export interface IContestProblem {
  type: string;
  contestId: number;
  index: number | string;
  name: string;
  problemUrl?: string;
  rating?: number;
  tags?: string[];
}
