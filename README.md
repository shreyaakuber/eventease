# EventEase – Workshop Registration System

A MERN-stack web app for creating technical workshops and managing participant registrations.

- **Live app:** https://eventease-one-phi.vercel.app
- **Backend API:** https://eventease-api-8k07.onrender.com
- **Source code:** https://github.com/shreyaakuber/eventease

> The backend runs on Render's free tier, which sleeps when idle. The first request after a while can take about 50 seconds to respond.

## Features

- **Event creation:** title, description, date, venue and seat limit
- **Participant registration:** name and email
- **Duplicate-registration prevention:** the same email cannot register twice for the same event
- **Seat-limit management:** registration closes automatically when an event is full, and the live seats-left count is shown on every event
- **Attendee list:** view everyone registered for an event, with cancellation that frees the seat

## Tech Stack

| Layer | Technology |
|---|---|
| Database | MongoDB Atlas (Mongoose) |
| Backend | Node.js, Express |
| Frontend | React (Vite) |
| Hosting | Render (API), Vercel (frontend) |

## How It Works

**Duplicate prevention.** The `Registration` collection has a unique compound index on `(event, email)`. MongoDB itself rejects a second registration, even if two requests arrive at the same time. Emails are stored in lowercase, so `A@x.com` and `a@x.com` count as the same person. The same email can still register for different events.

**Seat limits.** A seat is claimed with a single atomic update: `registeredCount` is incremented only if it is below `capacity`. Because the check and the increment happen in one database operation, two people cannot take the last seat. If the registration insert then fails (for example, a duplicate), the claimed seat is released.

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/events` | Create an event |
| GET | `/api/events` | List all events with seats left |
| GET | `/api/events/:id` | Get one event |
| POST | `/api/events/:id/register` | Register a participant |
| GET | `/api/events/:id/attendees` | List attendees of an event |
| DELETE | `/api/events/:eventId/registrations/:regId` | Cancel a registration |

**Status codes:** 201 created, 400 validation error, 404 not found, 409 duplicate registration or event full, 500 server error.

## Project Structure

```
eventease/
├── client/                React frontend (Vite)
│   └── src/App.jsx
└── server/                Express backend
    ├── config/db.js
    ├── models/            Event, Registration
    ├── controllers/
    ├── routes/
    └── server.js
```

## Local Setup

**Prerequisites:** Node.js 18+, a MongoDB Atlas account (or local MongoDB).

1. Clone the repository
   ```
   git clone https://github.com/shreyaakuber/eventease.git
   cd eventease
   ```

2. Backend
   ```
   cd server
   npm install
   ```
   Copy `.env.example` to `.env` and fill in:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   CLIENT_URL=http://localhost:5173
   ```
   Start it:
   ```
   npm run dev
   ```

3. Frontend (in a second terminal)
   ```
   cd client
   npm install
   ```
   In `client/src/App.jsx`, set the API address near the top to your local server:
   ```js
   const API = "http://localhost:5000/api";
   ```
   Start it:
   ```
   npm run dev
   ```

4. Open http://localhost:5173

## Deployment

- **Database:** MongoDB Atlas (network access open for the hosting provider)
- **Backend:** Render web service, root directory `server`, start command `npm start`, with `MONGO_URI` and `CLIENT_URL` set as environment variables
- **Frontend:** Vercel, root directory `client`

## Author

Shreya