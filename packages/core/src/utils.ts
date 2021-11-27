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
