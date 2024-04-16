import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import {
  createExpense,
  createIncome,
  getTransactionsWithBalance,
} from "../controllers/transactionController.js";

const router = Router();
router.use(verifyJWT);

router.route("/addIncome").post(createIncome);
router.route("/addExpense").post(createExpense);
router.route("/getTransactions").get(getTransactionsWithBalance);

export default router;
