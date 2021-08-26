import { IProblem } from '@cpany/types';

import axios from 'axios';
import { parse } from 'node-html-parser';
import iconv from 'iconv-lite';

const problems = new Map<number, IProblem>();

export function addToCache(pid: number, problem: IProblem) {
  problems.set(pid, problem);
}

export async function getProblem(pid: number): Promise<IProblem> {
  if (problems.has(pid)) return problems.get(pid)!;
  const data = await axios
    .get(`https://acm.hdu.edu.cn/showproblem.php`, {
      params: {
        pid
      },
      responseType: 'arraybuffer'
    })
    .then((res) => iconv.decode(res.data, 'gbk'));
  const root = parse(data);

  const problem: IProblem = {
    type: 'hdu',
    id: pid,
    name: root.querySelector('h1').innerText,
    problemUrl: `https://acm.hdu.edu.cn/showproblem.php?pid=${pid}`
  };
  problems.set(pid, problem);
  return problem;
}
