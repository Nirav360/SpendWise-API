import { Router } from "express";
import { verifyJWT } from "../middleware/auth.js";
import {
  createExpense,
  createIncome,
  getBalance,
  getExpenseByCategory,
  getTransactions,
  getTransactionsByMonth,
} from "../controllers/transactionController.js";

const router = Router();
router.use(verifyJWT);

router.route("/addIncome").post(createIncome);
router.route("/addExpense").post(createExpense);
router.route("/getBalance").get(getBalance);
router.route("/getTransactions").get(getTransactions);
router.route("/expenseByCategory").get(getExpenseByCategory);
router.route("/transactionsByMonth").get(getTransactionsByMonth);

export default router;
