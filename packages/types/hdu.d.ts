import type { IHandle } from './index';

export interface IHduMeta {
  hdu: {
    rank?: number;
  };
}

export declare type IHandleWithHdu = IHandle & IHduMeta;
