declare module 'prisma/config' {
  // Minimal typings to satisfy TypeScript for prisma.config.ts
  export type PrismaConfig = {
    schema?: string;
    migrations?: { path?: string };
    engine?: string;
    datasource?: { url?: string };
  };

  export function defineConfig(config: PrismaConfig): PrismaConfig;
  export function env(key: string, fallback?: string): string;
}
