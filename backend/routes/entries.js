const router    = require("express").Router();
const protect   = require("../middleware/auth");
const MilkEntry = require("../models/MilkEntry");

router.use(protect);

// GET /api/entries?month=2025-03               — all entries for a month
// GET /api/entries?customerId=xxx&month=2025-03 — filtered by customer
router.get("/", async (req, res) => {
  try {
    const { month, customerId, date } = req.query;
    const filter = {};
    if (month)      filter.date = { $regex: `^${month}` };
    if (date)       filter.date = date;
    if (customerId) filter.customerId = customerId;
    const entries = await MilkEntry.find(filter).sort({ date: 1 });
    res.json(entries);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/entries  — create or update (upsert by customerId + date)
router.post("/", async (req, res) => {
  try {
    const { customerId, date, milkItems, pettyExpense, delivered } = req.body;
    if (!customerId || !date)
      return res.status(400).json({ message: "customerId and date required" });

    const entry = await MilkEntry.findOneAndUpdate(
      { customerId, date },
      { milkItems, pettyExpense: pettyExpense ?? 0, delivered: delivered ?? true },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json(entry);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/entries/:id
router.delete("/:id", async (req, res) => {
  try {
    await MilkEntry.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
