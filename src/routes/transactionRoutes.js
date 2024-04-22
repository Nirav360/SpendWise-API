import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import {
  createExpense,
  createIncome,
  getExpenseByCategory,
  getTransactionsByMonth,
  getTransactionsWithBalance,
} from "../controllers/transactionController.js";

const router = Router();
router.use(verifyJWT);

router.route("/addIncome").post(createIncome);
router.route("/addExpense").post(createExpense);
router.route("/getTransactions").get(getTransactionsWithBalance);
router.route("/expenseByCategory").get(getExpenseByCategory);
router.route("/transactionsByMonth").get(getTransactionsByMonth);

export default router;
