const router  = require("express").Router();
const jwt     = require("jsonwebtoken");
const Admin   = require("../models/Admin");
const protect = require("../middleware/auth");

// ── POST /api/auth/register  (run once to create the admin account)
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username and password required" });

    const exists = await Admin.findOne({ username: username.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Username already exists" });

    const admin = await Admin.create({ username, password });
    res.status(201).json({ message: "Admin account created", id: admin._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: "Username and password required" });

    const admin = await Admin.findOne({ username: username.toLowerCase() });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await admin.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, username: admin.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/auth/change-password
router.post("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.user.id);
    const ok = await admin.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ message: "Current password incorrect" });
    admin.password = newPassword;
    await admin.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
