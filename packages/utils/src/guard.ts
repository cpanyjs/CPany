export function isUndef<T>(object: T | undefined | null): object is undefined | null {
  return object === undefined || object === null;
}

export function isDef<T>(object: T | undefined | null): object is T {
  return object !== undefined && object !== null;
}
