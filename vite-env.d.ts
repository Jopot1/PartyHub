// Fix: Removed '/// <reference types="vite/client" />' as it was causing a "Cannot find type definition file" error.
// Manually defining essential types for process.env (used in services) and ImportMeta to satisfy the TypeScript compiler.

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly [key: string]: string | boolean | undefined;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
    readonly GEMINI_API_KEY: string;
    readonly [key: string]: string | undefined;
  }
}
