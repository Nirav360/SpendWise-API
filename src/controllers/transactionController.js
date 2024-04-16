import Transaction from "../models/transactionModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";

const createIncome = asyncHandler(async (req, res, next) => {
  const owner = req.user._id;
  const { category, amount, date, type } = req.body;

  if ([category, amount, date, type].some((field) => field === "")) {
    return next(new ErrorHandler(400, "All fields are required"));
  }

  const transaction = await Transaction.findOne({ owner });

  if (transaction) {
    transaction.income.push({
      category,
      amount,
      date: new Date(date),
      type,
    });
    await transaction.save();
    return res
      .status(201)
      .json({ success: true, message: "Income added successfully" });
  } else {
    await Transaction.create({
      owner,
      income: [{ category, amount, date: new Date(date), type }],
      expense: [],
    });
    return res
      .status(201)
      .json({ success: true, message: "Income added successfully" });
  }
});

const createExpense = asyncHandler(async (req, res, next) => {
  const owner = req.user._id;
  const { category, description, amount, date, type } = req.body;

  if (
    [category, description, amount, date, type].some((field) => field === "")
  ) {
    return next(new ErrorHandler(400, "All fields are required"));
  }

  const transaction = await Transaction.findOne({ owner });

  if (!transaction) {
    return next(new ErrorHandler(404, "Kindly add income first"));
  }

  transaction.expense.push({
    category,
    description,
    amount,
    date: new Date(date),
    type,
  });
  await transaction.save();

  return res
    .status(201)
    .json({ success: true, message: "Expense added successfully" });
});

const getTransactionsWithBalance = asyncHandler(async (req, res, next) => {
  const owner = req.user._id;

  const transactionDetails = await Transaction.aggregate([
    { $match: { $expr: { $eq: ["$owner", { $toObjectId: owner }] } } },
    {
      $addFields: {
        totalIncome: {
          $sum: "$income.amount",
        },
        totalExpense: {
          $sum: "$expense.amount",
        },
      },
    },
    {
      $addFields: {
        totalBalance: {
          $subtract: ["$totalIncome", "$totalExpense"],
        },
        transactions: {
          $concatArrays: ["$income", "$expense"],
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalIncome: 1,
        totalExpense: 1,
        totalBalance: 1,
        transactions: {
          $sortArray: {
            input: "$transactions",
            sortBy: {
              date: -1,
            },
          },
        },
      },
    },
  ]);

  if (!transactionDetails?.length) {
    return next(new ErrorHandler(404, "No transactions"));
  }
  return res.status(200).json({
    success: true,
    message: "Transactions fetched successfully",
    transactionDetails: transactionDetails[0],
  });
});

export { createIncome, createExpense, getTransactionsWithBalance };
