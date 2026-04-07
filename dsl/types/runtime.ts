export interface Runtime {
    writeFile: (path: string, content: string) => any;
    readFile: (path: string) => any;
    appendFile: (path: string, content: string) => any;
    executeShell: (command: string) => any;
    exists: (path: string) => any;
}
