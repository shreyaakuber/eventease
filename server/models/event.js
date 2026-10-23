const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    description: { type: String, default: "", trim: true },
    date: { type: Date, required: [true, "Date is required"] },
    venue: { type: String, required: [true, "Venue is required"], trim: true },
    capacity: { type: Number, required: [true, "Capacity is required"], min: [1, "Capacity must be at least 1"] },
    registeredCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);