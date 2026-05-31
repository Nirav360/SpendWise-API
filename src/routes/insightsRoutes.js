import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import { fetchInsights } from "../controllers/insightController.js";

const router = Router();
router.use(verifyJWT);

router.route("/getInsights").get(fetchInsights);

export default router;
