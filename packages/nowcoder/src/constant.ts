import axios from 'axios';
import axiosRetry from 'axios-retry';

export const nowcoder = 'nowcoder';

export const api = axios.create({
  baseURL: 'https://ac.nowcoder.com',
  timeout: 10 * 1000
});

axiosRetry(api, { retries: 10 });
