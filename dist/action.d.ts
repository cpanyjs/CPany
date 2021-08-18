export interface IRunOption {
    disableGit?: boolean;
    configPath: string;
    maxRetry: number;
}
export declare function run({ configPath, maxRetry }: IRunOption): Promise<void>;
