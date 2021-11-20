import { join, dirname } from 'path';
import isInstalledGlobally from 'is-installed-globally';
import { sync as resolve } from 'resolve';
import { yarn, npm } from 'global-dirs';
import { execSync } from 'child_process';

let GlobalNodemodules: string | undefined;

export function resolveGlobal(importName: string, root = __dirname) {
  try {
    return resolve(importName, {
      preserveSymlinks: false,
      basedir: root
    });
  } catch {
    // Resovle local fail
  }

  try {
    if (!GlobalNodemodules) {
      GlobalNodemodules = execSync(`npm root -g`, { encoding: 'utf-8' });
    }
    return require.resolve(join(GlobalNodemodules!, importName));
  } catch {
    // Resolve global node_modules
  }

  try {
    return require.resolve(join(yarn.packages, importName));
  } catch {
    // Resolve global yarn fail
  }

  try {
    return require.resolve(join(npm.packages, importName));
  } catch {
    // Resolve global npm fail
  }

  return undefined;
}

export function resolveImportPath(importName: string, root: string, ensure: true): string;
export function resolveImportPath(
  importName: string,
  root?: string,
  ensure?: boolean
): string | undefined;
export function resolveImportPath(importName: string, root = __dirname, ensure = false) {
  try {
    return resolve(importName, {
      preserveSymlinks: false,
      basedir: root
    });
  } catch {}

  if (isInstalledGlobally) {
    try {
      return resolveGlobal(importName, root);
    } catch {}
  }

  if (ensure) throw new Error(`Failed to resolve package "${importName}"`);

  return undefined;
}

export function resolveCPanyPlugin(name: string, root: string = __dirname) {
  for (const plugin of [name, `@cpany/${name}`, `@cpany/plugin-${name}`, `cpany-plugin-${name}`]) {
    const resolved = resolveImportPath(`${plugin}/package.json`, root);
    if (resolved) {
      return { name: plugin, directory: dirname(resolved) };
    }
  }
  return undefined;
}
