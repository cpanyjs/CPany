export * from './searchRoot';

export * from './resolve';

export * from './package';

import fs from 'fs';
import net from 'net';
import path from 'path';

export function now() {
  return new Date(new Date().toUTCString());
}

export function slash(path: string) {
  return path.replace(/\\/g, '/');
}

export async function findFreePort(start: number): Promise<number> {
  function isPortFree(port: number) {
    return new Promise((resolve) => {
      const server = net.createServer((socket) => {
        socket.write('Echo server\r\n');
        socket.pipe(socket);
      });

      server.listen(port, '127.0.0.1');
      server.on('error', () => {
        resolve(false);
      });
      server.on('listening', () => {
        server.close();
        resolve(true);
      });
    });
  }

  if (await isPortFree(start)) return start;
  return findFreePort(start + 1);
}

export async function* listDir(dir: string): AsyncGenerator<string> {
  try {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const id = path.join(dir, dirent.name);
      if (dirent.name.startsWith('.')) {
        continue;
      }
      if (dirent.isDirectory()) {
        yield* listDir(id);
      } else {
        yield id;
      }
    }
  } catch {}
}
