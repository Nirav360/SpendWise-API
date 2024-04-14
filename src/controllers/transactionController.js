import Transaction from "../models/transactionModel";
import { asyncHandler } from "../utils/asyncHandler";

const createIncome = asyncHandler(async (req, res, next) => {
  const owner = req.user._id;
  const { category, amount, incomeDate } = req.body;

  if ([category, amount, incomeDate].some((field) => field?.trim() === "")) {
    return next(new ErrorHandler(400, "All fields are required"));
  }

  const transaction = await Transaction.findOne({ owner });

  if (transaction) {
    transaction.income.push({
      category,
      amount,
      incomeDate: new Date(incomeDate),
    });
    await transaction.save();
    return res
      .status(201)
      .json({ success: true, message: "Income added successfully" });
  } else {
    await Transaction.create({
      owner,
      income: [{ category, amount, incomeDate: new Date(incomeDate) }],
      expense: [],
    });
    return res
      .status(201)
      .json({ success: true, message: "Income added successfully" });
  }
});

const createExpense = asyncHandler(async (req, res, next) => {
  const owner = req.user._id;
});
