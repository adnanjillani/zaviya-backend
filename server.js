// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Menu = require("./models/menuModel");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
// mongoose.connect("mongodb://127.0.0.1:27017/zaviya", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ROUTES

// Health check (optional)
app.get("/", (req, res) => res.json({ ok: true, message: "Zaviya backend is running" }));

// Get all menu items
app.get("/menu", async (req, res) => {
  try {
    const menuItems = await Menu.find();
    res.json(menuItems);
  } catch (err) {
    console.error("[GET /menu] Error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Get single item by ID
app.get("/menu/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }
  try {
    const item = await Menu.findById(id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });
    res.json(item);
  } catch (err) {
    console.error(`[GET /menu/${id}] Error:`, err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Add new menu item
app.post("/menu", async (req, res) => {
  try {
    const { name, price, image, category, description } = req.body;
    if (!name || price == null || !image || !category) {
      return res.status(400).json({ message: "Missing required fields: name, price, image, category" });
    }

    const newItem = new Menu({ name, price, image, category, description });
    const savedItem = await newItem.save();
    console.log("[POST /menu] Created:", savedItem._id);
    res.status(201).json(savedItem);
  } catch (err) {
    console.error("[POST /menu] Error:", err);
    res.status(400).json({ message: err.message || "Error creating menu item" });
  }
});

// Update a specific menu item by ID (PUT)
app.put("/menu/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const { name, price, image, category, description } = req.body;
    const updatedItem = await Menu.findByIdAndUpdate(
      id,
      { name, price, image, category, description },
      { new: true, runValidators: true }
    );

    if (!updatedItem) return res.status(404).json({ message: "Menu item not found" });
    console.log(`[PUT /menu/${id}] Updated`);
    res.json({ message: "Menu item updated successfully", item: updatedItem });
  } catch (err) {
    console.error(`[PUT /menu/${id}] Error:`, err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Improved Delete a specific menu item by ID (DELETE)
app.delete("/menu/:id", async (req, res) => {
  const { id } = req.params;
  console.log(`[DELETE] Received request to delete id: "${id}"`);

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.warn(`[DELETE] Invalid ObjectId: "${id}"`);
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const deletedItem = await Menu.findByIdAndDelete(id);
    if (!deletedItem) {
      console.log(`[DELETE] No item found with id: "${id}"`);
      return res.status(404).json({ message: "Menu item not found" });
    }
    console.log(`[DELETE] Deleted item id: "${id}" name: "${deletedItem.name}"`);
    res.json({ message: "Menu item deleted successfully", item: deletedItem });
  } catch (err) {
    console.error("[DELETE] Error deleting item:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
