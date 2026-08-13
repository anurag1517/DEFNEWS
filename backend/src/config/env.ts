
import dotenv from 'dotenv';

dotenv.config();

export const env = {
    port: Number(process.env.PORT ?? 50001),
    logLevel: process.env.LOG_LEVEL ?? "info",
} as const;