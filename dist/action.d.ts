export interface IRunOption {
    logger?: boolean;
    logLevel?: 'warn' | 'error' | 'silent';
    basePath?: string;
    disableGit?: boolean;
    plugins?: string[];
    maxRetry: number;
}
export declare function run({ logger, logLevel, basePath, disableGit, plugins, maxRetry }: IRunOption): Promise<void>;
