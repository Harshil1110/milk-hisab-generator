const router  = require("express").Router();
const protect = require("../middleware/auth");
const Payment = require("../models/Payment");

router.use(protect);

// GET /api/payments?customerId=xxx&month=2025-03
router.get("/", async (req, res) => {
  try {
    const { customerId, month } = req.query;
    const filter = {};
    if (customerId) filter.customerId = customerId;
    if (month)      filter.date = { $regex: `^${month}` };
    const payments = await Payment.find(filter).sort({ date: -1 });
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/payments  — record a payment
router.post("/", async (req, res) => {
  try {
    const { customerId, amount, date, note } = req.body;
    if (!customerId || !amount) return res.status(400).json({ message: "customerId and amount required" });
    const payment = await Payment.create({ customerId, amount, date, note });
    res.status(201).json(payment);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/payments/:id
router.delete("/:id", async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: "Payment deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
