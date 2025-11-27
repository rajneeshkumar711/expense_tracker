import { QueryEngine } from '@prisma/adapter-pg';

declare module '@prisma/client' {
  interface PrismaClientOptions {
    adapter?: {
      query: QueryEngine;
    };
  }
}
