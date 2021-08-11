export * from './enum';

export interface ICPanyConfig {
  users?: Record<string, Record<string, string[] | string>>;
  contests?: string[];
  fetch?: string[];
  static?: string[];
}

export interface ICPanyUser {
  name: string;
  handles: Array<{ handle: string; type: string }>;
}
