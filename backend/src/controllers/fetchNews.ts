import { Request, Response, NextFunction } from "express";
import * as newsService from "../services/news.service";
import { AppError } from "../config/globalError";

export async function fetchNews(req: Request, res: Response, next: NextFunction) {
    console.log(`[API REQUEST] GET /api/news?category=${req.query.category || ''}`);
    try {
        const { category } = req.query;
        console.log('[API] Requesting cached news from newsService...');
        const articles = await newsService.getCachedNews();
        console.log(`[API] Successfully retrieved ${articles.length} articles from cache.`);

        if (articles.length === 0) {
            console.log('[API] Cache empty. Throwing AppError.');
            throw new AppError("No news articles found in cache", 404, "CACHE_EMPTY");
        }

        if (category) {
            console.log(`[API] Filtering articles by category: ${category}`);
            const filtered = articles.filter(
                a => a.category.toLowerCase() === (category as string).toLowerCase()
            );
            console.log(`[API] Returning ${filtered.length} filtered articles.`);
            res.json(filtered);
        } else {
            console.log('[API] Returning all articles.');
            res.json(articles);
        }
    } catch (error) {
        console.error('[API ERROR] Failed inside fetchNews controller:', error);
        next(error);
    }
}