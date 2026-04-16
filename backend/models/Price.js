const mongoose = require("mongoose");

const priceHistorySchema = new mongoose.Schema({
  date:        { type: String, required: true },   // "YYYY-MM-DD"
  prices:      { type: Map, of: Number, required: true },   // full snapshot
  changedFrom: { type: Map, of: Number, required: true },   // only changed types
}, { timestamps: true });

// Also store the current active prices as a single doc (upsert pattern)
const currentPriceSchema = new mongoose.Schema({
  singleton: { type: String, default: "current", unique: true },
  prices:    { type: Map, of: Number, required: true },
}, { timestamps: true });

module.exports = {
  PriceHistory: mongoose.model("PriceHistory", priceHistorySchema),
  CurrentPrice: mongoose.model("CurrentPrice", currentPriceSchema),
};
