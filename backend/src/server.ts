import cron from "node-cron";
import { createApp } from "./app";
import { env } from "./config/env";
import * as newsService from "./services/news.service";

const app = createApp();

async function startServer() {
    // 1. Start listening immediately so the server is responsive
    app.listen(env.port, () => {
        console.log(`Backend server is running on http://localhost:${env.port}`);
    });

    // 2. Initialize Redis client
    await newsService.initRedis();

    // 3. Perform initial ingestion on startup asynchronously in the background
    newsService.scrapeAndCacheNews().catch((err) => {
        console.error('Initial news ingestion failed:', err);
    });

    // 4. Start cron job (Every hour: '0 * * * *')
    cron.schedule('0 * * * *', async () => {
        try {
            await newsService.scrapeAndCacheNews();
        } catch (err) {
            console.error('Scheduled news ingestion failed:', err);
        }
    });
}

startServer();
