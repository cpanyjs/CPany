export function isCodeforces<T extends { type: string }>(entity: T): boolean {
  return entity.type.startsWith('codeforces');
}

export function isAtCoder<T extends { type: string }>(entity: T): boolean {
  return entity.type.startsWith('atcoder');
}

export function isNowCoder<T extends { type: string }>(entity: T): boolean {
  return entity.type.startsWith('nowcoder');
}

export function isLuogu<T extends { type: string }>(entity: T): boolean {
  return entity.type.startsWith('luogu');
}

export function isHdu<T extends { type: string }>(entity: T): boolean {
  return entity.type.startsWith('hdu');
}

export function isPintia<T extends { type: string }>(entity: T): boolean {
  return entity.type.startsWith('pintia');
}
