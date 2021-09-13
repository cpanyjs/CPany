import type { ICompressed } from './type';

export function load<T>(_compressed: any): T {
  const compressed = _compressed as ICompressed;
  return compressed.data;
}
