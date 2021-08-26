import type { IPlugin } from '@cpany/core';
import { createHduHandlePlugin } from './handle';

export interface IHduPluginOption {}

export function hduPlugin(option: IHduPluginOption = {}): IPlugin[] {
  return [createHduHandlePlugin()];
}
