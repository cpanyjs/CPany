import type { IContest, IHandle, ResolvedCPanyOption } from '@cpany/types';
import type { BasicPlugin } from './types';
import type { FetchContext } from './fetch';

export interface LoadPlugin extends BasicPlugin {
  load: (option: ResolvedCPanyOption, context: LoadContext) => Promise<void>;
}

export interface LoadContext extends FetchContext {
  addHandle: (...handles: IHandle[]) => void;

  addContest: (...contests: IContest[]) => void;

  findHandle: (platform: string, handle: string) => IHandle | undefined;

  // findUser: (name: string) => IUser | undefined;
}
