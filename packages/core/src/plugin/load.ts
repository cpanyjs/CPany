import type { IAuthor, IContest, IHandle, Key, ResolvedCPanyOption } from '@cpany/types';
import type { BasicPlugin } from './types';
import type { FetchContext } from './fetch';

export interface LoadPlugin extends BasicPlugin {
  load: (option: ResolvedCPanyOption, context: LoadContext) => Promise<void>;
}

export interface LoadContext extends FetchContext {
  addHandle: (...handles: IHandle[]) => void;

  addContest: (...contests: Key<IContest>[]) => void;

  addUserContest: (name: string, contest: Key<IContest>, author: IAuthor) => boolean;

  findHandle: (platform: string, handle: string) => IHandle | undefined;

  findUsername: (platform: string, handle: string) => string | undefined;
}
