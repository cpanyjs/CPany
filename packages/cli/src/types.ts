export interface ICliOption {
  /**
   * Data Path
   *
   * @default "./"
   */
  data: string;

  /**
   * CPany Plugins
   *
   * @default "codeforces,hdu"
   */
  plugins: string;

  // build
  outDir: string;
  emptyOutDir: boolean;

  // dev
  host?: string;
  port: number;
  force: boolean;
  open: boolean;
  clearScreen: boolean;
}

export interface ICliActionOption {
  log: 'warn' | 'error' | 'silent';
  maxRetry: number;
  plugins: string;
}

export type ICliExportOption = ICliOption & { page: string; out: string; type: string };

export interface IPluginOption {
  appRootPath: string;
  dataRootPath: string;
  configPath?: string;
  cliVersion: string;
  plugins: string[];
}
