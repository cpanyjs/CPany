export * from './searchRoot';

export * from './resolve';

export * from './package';

import net from 'net';

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
