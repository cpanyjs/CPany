import rawHistory from '~cpany/log';
import { load } from '@cpany/compress/load';
import { FetchLog } from '@cpany/types';

export const history = load<FetchLog>(rawHistory).history ?? {};
