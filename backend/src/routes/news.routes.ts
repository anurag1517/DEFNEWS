import { Router } from "express";
import * as news from "../controllers/fetchNews";

export const apiRouter = Router();

apiRouter.use("/news", news.fetchNews);
