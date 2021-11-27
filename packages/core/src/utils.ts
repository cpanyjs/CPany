export function sleep(duration: number): Promise<void> {
  return new Promise((res) => setTimeout(() => res(), duration));
}

export function random(left: number, right: number) {
  return left + Math.floor(Math.random() * (right - left + 1));
}