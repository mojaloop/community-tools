export interface AnyConfig {
  
}

export default abstract class BaseRunner {
  // @ts-ignore
  public abstract async run(config: AnyConfig): Promise<void>;
}