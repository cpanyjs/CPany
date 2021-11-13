import net from 'net';
import isInstalledGlobally from 'is-installed-globally';
import { sync as resolve } from 'resolve';
import resolveGlobal from 'resolve-global';

export function slash(path: string) {
  return path.replace(/\\/g, '/');
}

export function resolveImportPath(importName: string, ensure: true): string;
export function resolveImportPath(importName: string, ensure?: boolean): string | undefined;
export function resolveImportPath(importName: string, ensure = false) {
  try {
    return resolve(importName, {
      preserveSymlinks: false
    });
  } catch {}

  if (isInstalledGlobally) {
    try {
      return resolveGlobal(importName);
    } catch {}
  }

  if (ensure) throw new Error(`Failed to resolve package "${importName}"`);

  return undefined;
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
