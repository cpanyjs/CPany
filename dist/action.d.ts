export interface IRunOption {
    basePath?: string;
    disableGit?: boolean;
    configPath: string;
    maxRetry: number;
}
export declare function run({ basePath, disableGit, configPath, maxRetry }: IRunOption): Promise<void>;
