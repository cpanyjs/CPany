import type { IHandle } from './index';

export interface ILuoguMeta {
  luogu: {
    name: string;
  };
}

export type IHandleWithLuogu = IHandle & ILuoguMeta;

export interface DataResponse<T> {
  code: number;
  currentTemplate: string;
  currentData: T;
  currentTitle: string;
}

export type ProblemType = 'P' | 'B' | 'CF' | 'SP' | 'AT' | 'UVA' | 'T' | 'U';

export interface ProblemSummary {
  pid: string;
  title: string;
  difficulty: number;
  fullScore: number;
  type: ProblemType;
}

export interface Problem extends ProblemSummary {
  tags: number[];
  wantsTranslation: boolean;
  totalSubmit: number;
  totalAccepted: number;
  flag: number;
}

export interface UserSummary {
  uid: number;
  name: string;
  slogan: string;
  badge: string | null;
  isAdmin: boolean;
  isBanned: boolean;
  color: string;
  ccfLevel: number;
}

export interface Rating {
  contestRating: number;
  socialRating: number;
  practiceRating: number;
  basicRating: number;
  prizeRating: number;
  calculateTime: number;
  user: UserSummary;
  rating: number;
}

export interface BaseUser extends UserSummary {
  blogAddress: string;
  followingCount: number;
  followerCount: number;
  ranking?: number;
}

export interface Self extends BaseUser {
  verified: boolean;
  email: string;
  phone: string;
  unreadMessageCount: number;
  unreadNoticeCount: number;
}

export type User = BaseUser | Self;

export interface BaseUserDetails extends BaseUser {
  rating?: Rating;
  registerTime: number;
  introduction: string;
  prize: {
    year: number;
    contestName: string;
    prize: string;
  }[];
  background: string;
}

export interface SelfDetails extends BaseUserDetails, Self {}

export type UserDetails = BaseUserDetails | SelfDetails;

export interface UserData {
  user: UserDetails & {
    userRelationship: number;
    reverseUserRelationship: number;
    passedProblemCount: number;
    submittedProblemCount: number;
  };
  passedProblems: ProblemSummary[];
  submittedProblems: ProblemSummary[];
}

export type UserDataDto = DataResponse<UserData>;

export interface RecordBase {
  time: number | null;
  memory: number | null;
  problem: ProblemSummary;
  contest: ContestSummary | null;
  sourceCodeLength: number;
  submitTime: number;
  language: number;
  user?: UserSummary;
  id: number;
  status: number;
  enableO2: boolean;
  score: number;
}

export type RecordListDto = DataResponse<{ records: { result: RecordBase[] } }>;
