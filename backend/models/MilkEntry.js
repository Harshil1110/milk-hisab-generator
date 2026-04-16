const mongoose = require("mongoose");

// price is stored at the time of entry so mid-month changes don't affect past records
const milkItemSchema = new mongoose.Schema({
  type:  { type: String, enum: ["Gold","Shakti","Taza","TSP","Buttermilk"], required: true },
  qty:   { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },   // ← locked rate
}, { _id: false });

const entrySchema = new mongoose.Schema({
  customerId:   { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  date:         { type: String, required: true },   // "YYYY-MM-DD"
  milkItems:    { type: [milkItemSchema], default: [] },
  pettyExpense: { type: Number, default: 0 },
  delivered:    { type: Boolean, default: true },
}, { timestamps: true });

// One entry per customer per date
entrySchema.index({ customerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("MilkEntry", entrySchema);
