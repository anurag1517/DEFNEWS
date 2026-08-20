import { Router } from "express";
import * as news from "../controllers/fetchNews";
import { verifyClaim } from "../controllers/verifyClaim";
import { getWayAheadAnalysis } from "../controllers/wayAhead.controller";

export const apiRouter = Router();

apiRouter.get("/news", news.fetchNews);
apiRouter.post("/verify", verifyClaim);
apiRouter.post("/way-ahead", getWayAheadAnalysis);


