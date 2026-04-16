const mongoose = require("mongoose");

const defaultMilkSchema = new mongoose.Schema({
  type: { type: String, enum: ["Gold","Shakti","Taza","TSP","Buttermilk"], required: true },
  qty:  { type: Number, required: true, min: 0 },
}, { _id: false });

const customerSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  phone:       { type: String, required: true, trim: true },
  address:     { type: String, default: "" },
  advance:     { type: Number, default: 0 },
  defaultMilk: { type: [defaultMilkSchema], default: [] },
  active:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Customer", customerSchema);
