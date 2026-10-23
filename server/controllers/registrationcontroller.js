const mongoose = require("mongoose");
const Event = require("../models/event");
const Registration = require("../models/registration");

exports.register = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { name, email } = req.body;

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // 1. Atomically claim a seat only if one is free
    const event = await Event.findOneAndUpdate(
      { _id: eventId, $expr: { $lt: ["$registeredCount", "$capacity"] } },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );

    if (!event) {
      const exists = await Event.exists({ _id: eventId });
      return res.status(exists ? 409 : 404).json({ message: exists ? "Event is full" : "Event not found" });
    }

    // 2. Create registration; unique index blocks duplicates
    try {
      const reg = await Registration.create({ event: eventId, name, email });
      return res.status(201).json(reg);
    } catch (err) {
      // 3. Give the seat back on failure
      await Event.updateOne({ _id: eventId }, { $inc: { registeredCount: -1 } });
      if (err.code === 11000) {
        return res.status(409).json({ message: "This email is already registered for this event" });
      }
      if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((e) => e.message).join(", ");
        return res.status(400).json({ message });
      }
      throw err;
    }
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};

exports.cancelRegistration = async (req, res) => {
  try {
    const { eventId, regId } = req.params;
    if (!mongoose.isValidObjectId(eventId) || !mongoose.isValidObjectId(regId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const deleted = await Registration.findOneAndDelete({ _id: regId, event: eventId });
    if (!deleted) return res.status(404).json({ message: "Registration not found" });
    await Event.updateOne({ _id: eventId }, { $inc: { registeredCount: -1 } });
    res.json({ message: "Registration cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Could not cancel registration" });
  }
};