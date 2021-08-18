interface IGitFSOption {
    disable?: boolean;
    skipList?: Set<string>;
}
export declare function createGitFileSystem(basePath: string, { disable, skipList }?: IGitFSOption): Promise<{
    add: (path: string, content: string) => Promise<void>;
    push: (time: string) => Promise<void>;
}>;
export {};
