import type { ICompressed } from './type';

export function load<T>(_compressed: any): T {
  const compressed = _compressed as ICompressed;

  const keyMap = new Map<string, string>(
    (compressed.keyMaps ?? []).map(([key, value]) => [value, key])
  );
  const stringMap = new Map<string, string>(
    (compressed.stringMaps ?? []).map(([key, value]) => [value, key])
  );

  return walkTransKey(compressed.data, keyMap, stringMap);
}

function walkTransKey(obj: any, keyMap: Map<string, string>, stringMap: Map<string, string>) {
  if (obj === null || obj === undefined) return obj;
  const type = typeof obj;
  if (type === 'undefined') return obj;
  if (type === 'function') return obj;
  if (type === 'boolean') return obj;
  if (type === 'symbol') return obj;
  if (type === 'bigint') return obj;
  if (type === 'number') return obj;
  if (type === 'string') return stringMap.get(obj) ?? obj;
  if (Array.isArray(obj)) {
    const newArr: any[] = [];
    for (const item of obj) {
      newArr.push(walkTransKey(item, keyMap, stringMap));
    }
    return newArr;
  } else {
    const newObj: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const newKey = keyMap.get(key) ?? key;
      newObj[newKey] = walkTransKey(obj[key], keyMap, stringMap);
    }
    return newObj;
  }
}
