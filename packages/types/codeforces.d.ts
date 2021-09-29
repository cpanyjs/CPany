import type { IHandle, Verdict, ParticipantType } from './dist/index.d';

export interface ICodeforcesMeta {
  codeforces: {
    rank: string;
    rating: number;
    maxRank: string;
    maxRating: number;
  };
}

export type IHandleWithCodeforces = IHandle & ICodeforcesMeta;

export interface HandleDTO {
  handle: string;
  rank: string;
  rating: number;
  maxRank: string;
  maxRating: number;
  titlePhoto: string;
  avatar: string;
}

export interface ProblemDTO {
  contestId: number;
  index: string;
  name: string;
  rating: number;
  tags: string[];
}

export interface SubmissionDTO {
  id: number;
  contestId: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: ProblemDTO;
  author: {
    members: Array<{ handle: string }>;
    participantType: ParticipantType;
    teamName?: string;
  };
  programmingLanguage: string;
  verdict: Verdict;
}

export interface ContestDTO {
  id: number;
  name: string;
  type: 'CF' | 'IOI' | 'ICPC';
  phase:
    | 'BEFORE'
    | 'CODING'
    | 'PENDING_SYSTEM_TEST'
    | 'SYSTEM_TEST'
    | 'FINISHED';
  startTimeSeconds: number;
  durationSeconds: number;
}
