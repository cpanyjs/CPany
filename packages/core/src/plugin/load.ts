import type { ResolvedCPanyOption } from '@cpany/types';
import type { BasicPlugin } from './types';
import type { FetchContext } from './fetch';

export interface LoadPlugin extends BasicPlugin {
  load: (option: ResolvedCPanyOption, context: LoadContext) => Promise<void>;
}

export interface LoadContext extends FetchContext {}
