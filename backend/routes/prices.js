const router  = require("express").Router();
const protect = require("../middleware/auth");
const { PriceHistory, CurrentPrice } = require("../models/Price");

const DEFAULT_PRICES = { Gold: 34, Shakti: 30, Taza: 28, TSP: 26, Buttermilk: 16 };

router.use(protect);

// GET /api/prices  — get current prices (creates default if none exists)
router.get("/", async (req, res) => {
  try {
    let current = await CurrentPrice.findOne({ singleton: "current" });
    if (!current) {
      current = await CurrentPrice.create({ singleton: "current", prices: DEFAULT_PRICES });
    }
    res.json({ prices: Object.fromEntries(current.prices) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/prices/history  — all price change logs
router.get("/history", async (req, res) => {
  try {
    const history = await PriceHistory.find().sort({ date: -1 });
    res.json(history.map(h => ({
      ...h.toObject(),
      prices:      Object.fromEntries(h.prices),
      changedFrom: Object.fromEntries(h.changedFrom),
    })));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/prices  — update prices, automatically logs history
router.put("/", async (req, res) => {
  try {
    const { prices: newPrices } = req.body;
    if (!newPrices) return res.status(400).json({ message: "prices object required" });

    // Get current prices to diff
    let current = await CurrentPrice.findOne({ singleton: "current" });
    const oldPrices = current ? Object.fromEntries(current.prices) : DEFAULT_PRICES;

    // Detect what changed
    const changedFrom = {};
    Object.keys(newPrices).forEach(type => {
      if (newPrices[type] !== oldPrices[type]) changedFrom[type] = oldPrices[type];
    });

    const today = new Date().toISOString().split("T")[0];

    // Log history only if something actually changed
    if (Object.keys(changedFrom).length > 0) {
      await PriceHistory.create({ date: today, prices: newPrices, changedFrom });
    }

    // Upsert current prices
    current = await CurrentPrice.findOneAndUpdate(
      { singleton: "current" },
      { prices: newPrices },
      { new: true, upsert: true }
    );

    res.json({
      prices: Object.fromEntries(current.prices),
      changed: changedFrom,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
