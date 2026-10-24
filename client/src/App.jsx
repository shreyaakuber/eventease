import { useEffect, useState } from "react";
import "./App.css";

   const API = "https://eventease-api-8k07.onrender.com/api";

async function call(path, options) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong");
  return data;
}

function CreateEvent({ onCreated }) {
  const empty = { title: "", description: "", date: "", venue: "", capacity: "" };
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState("");

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await call("/events", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          date: new Date(form.date).toISOString(),
          capacity: Number(form.capacity),
        }),
      });
      setForm(empty);
      setMsg("Event created");
      onCreated();
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>Create Workshop</h2>
      <input name="title" placeholder="Title" value={form.title} onChange={change} required />
      <input name="venue" placeholder="Venue" value={form.venue} onChange={change} required />
      <textarea name="description" placeholder="Description" value={form.description} onChange={change} />
      <input name="date" type="datetime-local" value={form.date} onChange={change} required />
      <input name="capacity" type="number" min="1" placeholder="Seat limit" value={form.capacity} onChange={change} required />
      <button type="submit">Create Event</button>
      {msg && <p className="msg">{msg}</p>}
    </form>
  );
}

function EventCard({ event, onChange }) {
  const [form, setForm] = useState({ name: "", email: "" });
  const [msg, setMsg] = useState("");
  const [attendees, setAttendees] = useState(null);

  const loadAttendees = async () => {
    const data = await call(`/events/${event._id}/attendees`);
    setAttendees(data.attendees);
  };

  const register = async (e) => {
    e.preventDefault();
    try {
      await call(`/events/${event._id}/register`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ name: "", email: "" });
      setMsg("Registered successfully");
      onChange();
      if (attendees) loadAttendees();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const cancel = async (regId) => {
    await call(`/events/${event._id}/registrations/${regId}`, { method: "DELETE" });
    onChange();
    loadAttendees();
  };

  const full = event.seatsLeft <= 0;

  return (
    <div className="card">
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p>
        {new Date(event.date).toLocaleString()} | {event.venue}
      </p>
      <p className={full ? "full" : "seats"}>
        {full ? "FULL" : `${event.seatsLeft} seats left`} ({event.registeredCount}/{event.capacity})
      </p>

      <form onSubmit={register}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <button type="submit" disabled={full}>{full ? "Event Full" : "Register"}</button>
      </form>
      {msg && <p className="msg">{msg}</p>}

      <button className="link" onClick={() => (attendees ? setAttendees(null) : loadAttendees())}>
        {attendees ? "Hide attendees" : "View attendees"}
      </button>

      {attendees && (
        <table>
          <thead>
            <tr><th>#</th><th>Name</th><th>Email</th><th></th></tr>
          </thead>
          <tbody>
            {attendees.length === 0 && <tr><td colSpan="4">No registrations yet</td></tr>}
            {attendees.map((a, i) => (
              <tr key={a._id}>
                <td>{i + 1}</td>
                <td>{a.name}</td>
                <td>{a.email}</td>
                <td><button className="link" onClick={() => cancel(a._id)}>Cancel</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function App() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setEvents(await call("/events"));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container">
      <h1>EventEase</h1>
      <p className="sub">Workshop Registration System</p>
      <CreateEvent onCreated={load} />
      <h2>Upcoming Workshops</h2>
      {error && <p className="msg">{error}</p>}
      {events.length === 0 && !error && <p>No workshops yet. Create one above.</p>}
      {events.map((ev) => (
        <EventCard key={ev._id} event={ev} onChange={load} />
      ))}
    </div>
  );
}