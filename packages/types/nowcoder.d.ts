import type { IHandle } from './dist/index.d';

export interface INowcoderTeam {
  teamId: number;
  name: string;
  nickname: string;
  members: string[];
  avatar: string;
  teamUrl: string;
  rating?: number;
  rank?: number;
}

export interface INowcoderMeta {
  nowcoder: {
    name: string;
    rating?: number;
    rank?: number;
    teams: INowcoderTeam[];
    contests: number[];
  };
}

export type IHandleWithNowcoder = IHandle & INowcoderMeta;
