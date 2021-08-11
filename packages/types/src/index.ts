export interface ICPanyConfig {
  static?: string[];
  users?: Record<string, Record<string, string[] | string>>;
}

export interface ICPanyUser {
  name: string;
  handles: Array<{ handle: string; type: string }>;
}
