export default interface IQueueEnvironment {
  queueHost(): string | undefined;
  queuePort(): number | undefined;
  location(): Promise<string>;
  silent(): boolean;
  loose(): boolean;
  cert(): string | undefined;
  key(): string | undefined;
  pwd(): string | undefined;
  https(): boolean;
  debug(): Promise<string | boolean | undefined>;
}
