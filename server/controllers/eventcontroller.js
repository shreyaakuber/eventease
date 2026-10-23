const mongoose = require("mongoose");
const Event = require("../models/event");
const Registration = require("../models/registration");

const withSeats = (e) => ({ ...e, seatsLeft: e.capacity - e.registeredCount });

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, venue, capacity } = req.body;
    if (date && new Date(date) < new Date()) {
      return res.status(400).json({ message: "Event date must be in the future" });
    }
    const event = await Event.create({ title, description, date, venue, capacity });
    res.status(201).json(withSeats(event.toObject()));
  } catch (err) {
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((e) => e.message).join(", ");
      return res.status(400).json({ message });
    }
    res.status(500).json({ message: "Could not create event" });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).lean();
    res.json(events.map(withSeats));
  } catch (err) {
    res.status(500).json({ message: "Could not fetch events" });
  }
};

exports.getEventById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(withSeats(event));
  } catch (err) {
    res.status(500).json({ message: "Could not fetch event" });
  }
};

exports.getAttendees = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ message: "Event not found" });
    const attendees = await Registration.find({ event: req.params.id }).sort({ createdAt: 1 }).lean();
    res.json({ event: withSeats(event), attendees });
  } catch (err) {
    res.status(500).json({ message: "Could not fetch attendees" });
  }
};