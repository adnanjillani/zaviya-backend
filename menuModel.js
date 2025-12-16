// models/menumodel.js
const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: "Delicious dish from our menu." },
}, { timestamps: true });

module.exports = mongoose.model("Menu", menuSchema);
