import type { IUserOverview } from '@cpany/types';
import { load } from '@cpany/compress/load';

import rawUsers from './cpany/users.json';

export const users = load<IUserOverview[]>(rawUsers);
