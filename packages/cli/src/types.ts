import { ResolvedCPanyOption } from '@cpany/types';

export interface ICliOption {
  /**
   * Data Path
   *
   * @default "./"
   */
  dataRoot: string;

  /**
   * Resolved CPany Option
   */
  option: ResolvedCPanyOption;

  /**
   * CPany Plugins
   *
   * @default "['codeforces', 'hdu']"
   */
  plugins: string[];

  /**
   * Log level
   */
  log: 'warn' | 'error' | 'silent';

  // build
  outDir: string;
  emptyOutDir: boolean;
  base: string;

  // dev
  dev: boolean; // Set in resolveViteOptions
  host?: string;
  port: number;
  force: boolean;
  open: boolean;
  clearScreen: boolean;

  // Fetch
  /**
   * @default 5
   */
  maxRetry: number;
}

export type ICliExportOption = ICliOption & { page: string; out: string; type: string };

export interface IPluginOption extends ICliOption {
  appRoot: string;
  cliVersion: string;
}
