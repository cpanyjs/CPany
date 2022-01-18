export function sleep(duration: number): Promise<void> {
  return new Promise((res) => setTimeout(() => res(), duration));
}

export function random(left: number, right: number) {
  return left + Math.floor(Math.random() * (right - left + 1));
}

export function addExt(filename: string, ext = 'json') {
  if (filename.endsWith(`.${ext}`)) {
    return filename;
  } else {
    return `${filename}.${ext}`;
  }
}

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function diff<T>(f: (item: T) => string, old: T[], cur: T[]): T[] {
  const delta: T[] = [];
  const set = new Set(old.map(f));
  for (const item of cur) {
    if (!set.has(f(item))) {
      delta.push(item);
    }
  }
  return delta;
}
