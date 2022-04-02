import type { CompressNameHandleList } from '@cpany/types';
import { load } from '@cpany/compress/load';

import rawHandles from './cpany/ncHandles.json';

export const handles = load<CompressNameHandleList>(rawHandles);

const handleUser = new Map<string, string>(handles.map((handle) => [handle.hn, handle.n]));

const handleRating = new Map<string, number>(handles.map((handle) => [handle.hn, handle.r]));

export function findHandleUser(handle: string) {
  return handleUser.get(handle) ?? handle;
}

export function findHandleRating(handle: string) {
  return handleRating.get(handle);
}
