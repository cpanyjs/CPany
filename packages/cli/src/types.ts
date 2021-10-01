export interface ICliOption {
  data: string;

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
  maxRetry: number;
  plugins: string;
}

export interface IPluginOption {
  appRootPath: string;
  dataRootPath: string;
  configPath?: string;
  cliVersion: string;
}
