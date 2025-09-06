
declare global {
  interface Window {
    Intercom?: (command: string, options?: any) => void;
  }
}

export {};
