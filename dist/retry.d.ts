declare type TaskFn = () => Promise<boolean>;
export declare function createRetryContainer(maxRetry?: number): {
    add: (id: string, fn: TaskFn) => void;
    run: () => Promise<void>;
};
export {};
