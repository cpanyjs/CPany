import axios from 'axios';
import type { ICookie } from './type';

export const luogu = 'luogu';

function loadCookie(): ICookie {
  const clientId = process.env.CLIENT_ID;
  const uid = process.env.UID;
  if (!clientId) {
    console.error('Please set env variable CLIENT_ID !');
    process.exit(1);
  }
  if (!uid) {
    console.error('Please set env variable UID !');
    process.exit(1);
  }
  return { clientId, uid };
}

export function getAPI() {
  const cookie = loadCookie();

  return axios.create({
    baseURL: 'https://www.luogu.com.cn/',
    headers: {
      'x-luogu-type': 'content-only',
      Cookie: `_uid=${cookie.uid}; __client_id=${cookie.clientId}`
    }
  });
}
