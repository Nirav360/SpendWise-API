import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
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
      date: {
        type: Date,
        required: true,
      },
      type: {
        type: String,
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
      date: {
        type: Date,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
    },
  ],
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
