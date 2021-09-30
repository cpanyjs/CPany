export interface IRunOption {
    logger?: boolean;
    basePath?: string;
    disableGit?: boolean;
    plugins?: string[];
    maxRetry: number;
}
export declare function run({ logger, basePath, disableGit, plugins, maxRetry }: IRunOption): Promise<void>;
