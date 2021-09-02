export interface IRunOption {
    basePath?: string;
    disableGit?: boolean;
    configPath: string;
    maxRetry: number;
    plugins?: string[];
}
export declare function run({ basePath, plugins, disableGit, configPath, maxRetry }: IRunOption): Promise<void>;
