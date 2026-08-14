import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
    'REDIS_URL',
    'PIB_FEED_URL',
    'NDTV_FEED_URL',
    'GOOGLE_NEWS_FEED_URL',
    'ALT_NEWS_FEED_URL',
    'GOOGLE_TRENDS_FEED_URL'
];

// Validate that all required configuration keys exist
for (const key of requiredEnvVars) {
    if (!process.env[key]) {
        throw new Error(`CRITICAL CONFIGURATION ERROR: Missing required environment variable '${key}' in .env`);
    }
}

const currentEnv = process.env.NODE_ENV ?? "development";
const isDev = process.env.NODE_DEV === "true" || currentEnv === "development";

export const env = {
    nodeEnv: currentEnv,
    nodeDev: isDev,
    isProduction: currentEnv === "production",
    isDevelopment: isDev,
    port: Number(process.env.PORT ?? 5001),
    logLevel: process.env.LOG_LEVEL ?? "info",
    redisUrl: process.env.REDIS_URL!,
    pibFeedUrl: process.env.PIB_FEED_URL!,
    ndtvFeedUrl: process.env.NDTV_FEED_URL!,
    googleNewsFeedUrl: process.env.GOOGLE_NEWS_FEED_URL!,
    altNewsFeedUrl: process.env.ALT_NEWS_FEED_URL!,
    googleTrendsFeedUrl: process.env.GOOGLE_TRENDS_FEED_URL!,
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173'
} as const;
