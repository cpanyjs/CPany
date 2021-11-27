export interface BasicPlugin {
  name: string;

  platform: string;

  enforce?: 'pre' | 'post';
}
