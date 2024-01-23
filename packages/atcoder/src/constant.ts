import axios, { type AxiosInstance } from 'axios';

export const atcoder = 'atcoder';

export function loadCookie(): string {
  const session = process.env.REVEL_SESSION;
  if (!session) {
    console.error('Please set env variable REVEL_SESSION !');
    process.exit(1);
  }
  return session!;
}

export function getAPI(): AxiosInstance {
  const cookie = loadCookie();

  return axios.create({
    baseURL: 'https://atcoder.jp/',
    headers: {
      Cookie: `REVEL_FLASH=; REVEL_SESSION=${cookie}`
    }
  });
}
