const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
    },
    invoiceId: {
      type: String,
      //   sparse: true,
      index: true,
      //   required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "KES",
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "PROCESSING", "COMPLETE", "FAILED"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["MPESA_STK", "CHECKOUT"],
    },
    customerDetails: {
      type: Object,
      required: false,
    },
    paymentDetails: {
      type: Object,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
