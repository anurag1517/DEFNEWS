import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { globalErrorHandler } from "./globalErrorHandler";
import { apiRouter } from "./routes/news.routes";

export function createApp() {
    const app = express();

    app.use(cors({
        origin: env.isProduction ? env.frontendUrl : '*'
    }));
    app.use(express.json());

    app.use(express.urlencoded({
        extended: true
    }))

    // Register routes
    app.use("/api", apiRouter);

    //error handling
    app.use(globalErrorHandler);
    return app;
}