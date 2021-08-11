export * from './enum';

export * from './handle';

export * from './submission';

export * from './problem';

export * from './contest';

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
