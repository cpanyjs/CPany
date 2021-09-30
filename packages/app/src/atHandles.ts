import type { CompressHandleList } from '@cpany/types';
import { load } from '@cpany/compress/load';

import rawHandles from './cpany/atHandles.json';

export const handles = load<CompressHandleList>(rawHandles);

const handleUser = new Map<string, string>(handles.map((handle) => [handle.h, handle.n]));

const handleRating = new Map<string, number>(handles.map((handle) => [handle.h, handle.r]));

export function findHandleUser(handle: string) {
  return handleUser.get(handle) ?? handle;
}

export function findHandleRating(handle: string) {
  return handleRating.get(handle);
}
