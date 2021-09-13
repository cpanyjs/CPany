export interface ICompressed {
  keyMaps?: Array<[string, string]>;

  stringMaps?: Array<[string, string]>;

  data: any;
}

export interface ICompressOption {
  // default: true
  enable?: boolean;
}
