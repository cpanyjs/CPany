import isInstalledGlobally from 'is-installed-globally';
import { sync as resolve } from 'resolve';
import resolveGlobal from 'resolve-global';

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

export function resolveCPanyPlugin(name: string) {
  for (const plugin of [name, `@cpany/${name}`, `@cpany/plugin-${name}`, `cpany-plugin-${name}`]) {
    const resolved = resolveImportPath(plugin);
    if (!!resolved) {
      return resolved;
    }
  }
  return undefined;
}
