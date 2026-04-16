const router   = require("express").Router();
const protect  = require("../middleware/auth");
const Customer = require("../models/Customer");

// All routes protected
router.use(protect);

// GET /api/customers  — list all active customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find({ active: true }).sort({ name: 1 });
    res.json(customers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/customers/:id
router.get("/:id", async (req, res) => {
  try {
    const c = await Customer.findById(req.params.id);
    if (!c) return res.status(404).json({ message: "Customer not found" });
    res.json(c);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/customers  — create
router.post("/", async (req, res) => {
  try {
    const { name, phone, address, advance, defaultMilk } = req.body;
    if (!name || !phone) return res.status(400).json({ message: "Name and phone required" });
    const customer = await Customer.create({ name, phone, address, advance, defaultMilk });
    res.status(201).json(customer);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/customers/:id  — update
router.put("/:id", async (req, res) => {
  try {
    const { name, phone, address, advance, defaultMilk } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, phone, address, advance, defaultMilk },
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/customers/:id  — soft delete
router.delete("/:id", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id, { active: false }, { new: true }
    );
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Customer removed" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
