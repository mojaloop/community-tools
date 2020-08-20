

export type AnyConfig = {}

export default abstract class BaseRunner {
  public abstract async run(config: AnyConfig): Promise<void>;
}