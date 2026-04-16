const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  amount:     { type: Number, required: true, min: 1 },
  date:       { type: String, required: true },
  note:       { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);