export interface IPluginOption {
  appRootPath: string;
  dataRootPath: string;
  configPath?: string;

  home: {
    contests: number;
    recent: number;
  };
}
