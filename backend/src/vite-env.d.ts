/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LANDING_URL: string
  readonly VITE_ACADEMY_URL: string
  readonly VITE_GAMES_URL: string
  readonly VITE_BLOCKGIGS_URL: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}