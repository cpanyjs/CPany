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
