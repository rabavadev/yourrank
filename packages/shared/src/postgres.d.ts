declare module "postgres" {
  interface PostgresOptions {
    max?: number;
    prepare?: boolean;
    idle_timeout?: number;
    connect_timeout?: number;
    debug?: boolean;
  }

  interface PostgresClient {
    unsafe(query: string, params?: any[]): Promise<any[]>;
    begin<R>(fn: (sql: any) => Promise<R>): Promise<R>;
    end(opts?: { timeout?: number }): Promise<void>;
  }

  function postgres(connectionString: string, options?: PostgresOptions): PostgresClient;
  export default postgres;
}
