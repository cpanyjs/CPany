import { spawn } from 'child_process';

export function capture(url: string): Promise<void> {
  return new Promise((res, rej) => {
    const subprocess = spawn('npx', [
      'capture-website',
      `${url}/members`,
      '--full-page',
      '--no-default-background',
      '--overwrite',
      '--style',
      'html, body { background-color: white; }',
      '--delay',
      '1',
      '--type',
      'webp',
      '--output',
      'screenshot.webp'
    ]);
    subprocess.stderr.on('data', (chunk) => {
      console.error(`${chunk}`);
    });
    subprocess.on('close', (code) => {
      if (code === 0) res();
      else rej();
    });
  });
}
