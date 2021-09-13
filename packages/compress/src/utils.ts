export function createCounter(keys: string[] = []) {
  const set = new Set(keys);

  const table: string[] = [
    ...'abcdefghijklmnopqrstuvwxyz'.split(''),
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    ...'0123456789'.split('')
  ];

  let cur = 0;
  const innerNext = () => {
    const value: string[] = [];
    let x = cur;
    do {
      value.push(table[x % table.length]);
      x = (x / table.length) | 0;
    } while (x > 0);
    cur++;
    return value.join('');
  };

  const next = () => {
    while (true) {
      const key = innerNext();
      if (!set.has(key)) return key;
    }
  };

  return { next };
}
