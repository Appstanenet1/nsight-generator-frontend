declare module 'node:sqlite' {
  export type StatementParameters = Record<string, string | number>;

  export class StatementSync {
    get(parameters?: StatementParameters): object | undefined;
    all(parameters?: StatementParameters): object[];
  }

  export type DatabaseSyncOptions = {
    readonly?: boolean;
  };

  export class DatabaseSync {
    constructor(path: string, options?: DatabaseSyncOptions);
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
