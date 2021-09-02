export interface IRunOption {
    logger?: boolean;
    basePath?: string;
    disableGit?: boolean;
    plugins?: string[];
    configPath: string;
    maxRetry: number;
}
export declare function run({ logger, basePath, disableGit, plugins, configPath, maxRetry }: IRunOption): Promise<void>;
