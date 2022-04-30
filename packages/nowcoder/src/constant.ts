import axios from 'axios';
import axiosRetry from 'axios-retry';

export const nowcoder = 'nowcoder';

function getProxy() {
  const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (proxy) {
    const match = /^https?:\/\/(\d+\.\d+\.\d+\.\d+):(\d+)$/.exec(proxy);
    if (match) {
      return {
        protocol: match[1],
        host: match[2],
        port: +match[3]
      };
    } else {
      return false;
    }
  } else {
    return false;
  }
}

export const api = axios.create({
  baseURL: 'https://ac.nowcoder.com',
  timeout: 10 * 1000,
  proxy: getProxy()
});

axiosRetry(api, { retries: 10 });
