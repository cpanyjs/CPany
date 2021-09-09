interface IGitFSOption {
    disable?: boolean;
}
export declare function createGitFileSystem(basePath: string, { disable }?: IGitFSOption): Promise<{
    add: (path: string, content: string) => Promise<void>;
    rm: (path: string) => Promise<void>;
    push: (time: string) => Promise<void>;
}>;
export {};
