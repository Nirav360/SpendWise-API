import Transaction from "../models/transactionModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateInsights } from "../services/geminiService.js";

const fetchInsights = asyncHandler(async (req, res, next) => {
  try {
    const owner = req.user._id;

    // Current date
    const now = new Date();

    // Current month/year
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Previous month/year
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Fetch all transactions
    const transactions = await Transaction.findOne({
      owner,
    });

    if (!transactions) {
      return res.status(404).json({
        success: false,
        message: "No transactions found",
      });
    }

    const mergedTransactions = [
      ...transactions.income,
      ...transactions.expense,
    ];

    // Format data
    const formattedTransactions = mergedTransactions.map((t) => ({
      category: t.category,
      description: t.description,
      amount: t.amount,
      paymentMode: t.paymentMode,
      type: t.type,
      date: t.date,
    }));

    // Current month transactions
    const currentMonthData = formattedTransactions.filter((t) => {
      const d = new Date(t.date);

      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Previous month transactions
    const previousMonthData = formattedTransactions.filter((t) => {
      const d = new Date(t.date);

      return d.getMonth() === previousMonth && d.getFullYear() === previousYear;
    });

    // Generate AI insights
    const insights = await generateInsights(
      currentMonthData,
      previousMonthData,
    );

    const bullets = insights
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && (line.startsWith("•") || line.startsWith("-")))
      .map((line) => line.replace(/^[-•]\s*/, ""));
    return res.json({
      success: true,
      bullets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate insights",
    });
  }
});

export { fetchInsights };
