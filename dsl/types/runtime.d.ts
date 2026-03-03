export interface Runtime {
    writeFile: (path: string, content: string) => Promise<void>;
    readFile: (path: string) => Promise<string>;
    appendFile: (path: string, content: string) => Promise<void>;
    executeShell: (command: string) => Promise<void>;
    exists: (path: string) => Promise<boolean>;
}
