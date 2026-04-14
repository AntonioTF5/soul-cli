export interface InitOptions {
    name?: string;
    description?: string;
    tone?: string;
    interactive?: boolean;
    output?: string;
}
export declare function runInit(opts: InitOptions): Promise<void>;
