import { Router } from "express";
import * as news from "../controllers/fetchNews";
import { verifyClaim } from "../controllers/verifyClaim";

export const apiRouter = Router();

apiRouter.get("/news", news.fetchNews);
apiRouter.post("/verify", verifyClaim);

