import mongoose from "mongoose";
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

const getExpenseByCategory = asyncHandler(async (req, res, next) => {
  const owner = req.user._id;

  const expenseByCategoryPercentage = await Transaction.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(owner),
      },
    },
    {
      $unwind: "$expense",
    },
    {
      $group: {
        _id: "$expense.category",
        totalExpense: {
          $sum: "$expense.amount",
        },
      },
    },
    {
      $group: {
        _id: null,
        totalExpense: {
          $sum: "$totalExpense",
        },
        categories: {
          $push: {
            category: "$_id",
            totalExpense: "$totalExpense",
          },
        },
      },
    },
    {
      $unwind: "$categories",
    },
    {
      $project: {
        _id: 0,
        id: {
          $concat: ["$categories.category", { $toString: "$totalExpense" }],
        },
        label: "$categories.category",
        value: {
          $multiply: [
            {
              $divide: ["$categories.totalExpense", "$totalExpense"],
            },
            100,
          ],
        },
      },
    },
  ]);

  if (!expenseByCategoryPercentage?.length) {
    return next(new ErrorHandler(404, "No transactions"));
  }

  return res.status(200).json({
    success: true,
    message: "Transactions fetched successfully",
    expenseByCategory: expenseByCategoryPercentage,
  });
});

const getTransactionsByMonth = asyncHandler(async (req, res, next) => {
  const owner = req.user._id;

  const transactionsByMonth = await Transaction.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(owner),
      },
    },
    {
      $project: {
        transactions: {
          $concatArrays: ["$income", "$expense"], // Concatenate income and expense arrays
        },
      },
    },
    {
      $unwind: "$transactions",
    },
    {
      $project: {
        category: "$transactions.category",
        amount: "$transactions.amount",
        date: "$transactions.date",
        type: "$transactions.type",
        month: {
          $dateToString: {
            format: "%b",
            date: "$transactions.date",
          },
        }, // Extract the name of the month from the transaction date
      },
    },
    {
      $group: {
        _id: { month: "$month", type: "$type" }, // Group by month name and transaction type (income or expense)
        totalAmount: { $sum: "$amount" }, // Calculate total amount for each group
      },
    },

    {
      $group: {
        _id: "$_id.month", // Group by month name only
        income: {
          $max: {
            $cond: [{ $eq: ["$_id.type", "income"] }, "$totalAmount", 0],
          },
        }, // Calculate total income
        expense: {
          $max: {
            $cond: [{ $eq: ["$_id.type", "expense"] }, "$totalAmount", 0],
          },
        }, // Calculate total expense
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id",
        income: 1,
        expense: 1,
      },
    },
    {
      $sort: {
        month: 1,
      },
    },
  ]);

  if (!transactionsByMonth?.length) {
    return next(new ErrorHandler(404, "No transactions"));
  }

  return res.status(200).json({
    success: true,
    message: "Transactions fetched successfully",
    transactionsByMonth,
  });
});

export {
  createIncome,
  createExpense,
  getTransactionsWithBalance,
  getExpenseByCategory,
  getTransactionsByMonth,
};
