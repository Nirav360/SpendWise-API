import mongoose from "mongoose";

const transactionSchema = new Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  income: [
    {
      category: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      incomeDate: {
        type: Date,
        required: true,
      },
    },
  ],
  expense: [
    {
      category: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      expenseDate: {
        type: Date,
        required: true,
      },
    },
  ],
});

const Transaction = model("Transaction", transactionSchema);

export default Transaction;
