const express = require("express");
const router = express.Router();
const event = require("../controllers/eventcontroller");
const reg = require("../controllers/registrationcontroller");

router.post("/", event.createEvent);
router.get("/", event.getEvents);
router.get("/:id", event.getEventById);
router.get("/:id/attendees", event.getAttendees);
router.post("/:id/register", reg.register);
router.delete("/:eventId/registrations/:regId", reg.cancelRegistration);

module.exports = router;