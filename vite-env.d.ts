/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TWITTERAPI_IO_KEY?: string;
  readonly VITE_PRIVATE_TWIN_LLM_API_KEY?: string;
  readonly VITE_PRIVATE_TWIN_LLM_BASE_URL?: string;
  readonly VITE_PRIVATE_TWIN_LLM_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Fallback module declarations for assets (in case tooling misses vite/client)
declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.webp' {
  const src: string;
  export default src;
}
