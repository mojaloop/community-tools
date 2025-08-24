declare module '@mojaloop/central-services-logger' {
  const Logger: {
    error: (message: string, ...args: any[]) => void;
    info: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
  };
  export default Logger;
} 