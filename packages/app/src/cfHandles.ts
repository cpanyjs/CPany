import type { CodeforcesHandleList } from '@cpany/types';
import rawHandles from './cpany/cfHandles.json';

export const handles = rawHandles as CodeforcesHandleList;

const handleUser = new Map<string, string>(
  handles.map((handle) => [handle.h, handle.n])
);

const handleRating = new Map<string, number>(
  handles.map((handle) => [handle.h, handle.r])
);

export function findHandleUser(handle: string) {
  return handleUser.get(handle) ?? handle;
}

export function findHandleRating(handle: string) {
  return handleRating.get(handle);
}