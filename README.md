<p align="center">
  <img src="mobile/assets/icon.png" width="110" alt="StyleBook logo"/>
</p>

<h1 align="center">StyleBook</h1>
<p align="center"><b>Beauty & barber booking platform for Ghana</b><br/>
Find a shop near you, book an exact time slot, or join the walk-in queue — while owners run their whole business from one dashboard.</p>

---

## Why StyleBook

Booking a haircut in Ghana is informal: walk in, sit, wait. Customers lose time; shop owners can't plan their day. StyleBook digitizes the whole flow for both sides — appointments *and* the walk-in culture that global booking apps ignore.

## Features

**Customer side**
- Discover shops by name, category (Salon / Barbershop / Spa / Nails) and city
- 🧭 **Near me** — GPS search sorted by real distance (Haversine)
- Shop profiles: live open/closed status, services & prices, photo gallery, verified reviews with owner replies, share to WhatsApp
- **Smart booking** — 3-step flow with time slots generated from each day's real opening hours, service-duration blocking, no double bookings, past times hidden, 30-min buffers at open/close
- 45-second auto-confirm if the shop doesn't respond
- **Walk-in queue** — join remotely, watch your position live, leave anytime
- Bookings hub: upcoming / rescheduled / completed / cancelled, reschedule with live availability, 10-minute appointment reminders
- Instagram-style feed of shop posts (like, comment, book from a post)
- Favourites, review history, dark/light theme (light default)

**Owner side**
- Business dashboard: stats, pending-booking alerts, quick actions
- Bookings inbox with confirm/cancel
- Live queue management: call next, mark done, remove
- Shop profile editor: cover photo, gallery (plan-limited), services with edit/delete, per-day opening hours, GPS location pin, location description
- Posts with captions, review replies (edit/delete)
- Subscription plans: Free / Pro (GHS 120/mo) / Enterprise (GHS 300/mo)

## Tech stack

| Layer | Technology |
|---|---|
| Mobile app | React Native (Expo SDK 54) · TypeScript · React Navigation · Axios |
| Backend | Spring Boot 3.2 · Java 17 · Spring Security (JWT) · Spring Data JPA |
| Database | PostgreSQL — 11 tables, UUID keys, FK-enforced relationships |
| Auth | Stateless JWT · BCrypt password hashing · role + ownership checks |

## Architecture

Client–server. The mobile app owns presentation; **all business rules live on the server** (availability, conflicts, review eligibility, plan limits — nothing is trusted from the client). The backend is a modular monolith — Auth / Shop / Booking / Review / Post / Queue services with clean boundaries, deliberately structured so any domain can be extracted to a microservice when scale demands.

Highlights:
- **Slot engine** — per-day opening windows + 30-min buffers → 30-min interval candidates → duration-overlap rejection against existing bookings → today's past times removed
- **Auto-confirm scheduler** — `@Scheduled` jobs promote pending bookings after 45s and complete finished ones (unlocking reviews)
- **Queue positions** computed live from join order; wait estimate = sum of service durations ahead

## Running locally

**Prerequisites:** JDK 17 · Maven · PostgreSQL · Node.js · Expo Go app on your phone

```bash
# 1. Database (one time)
psql -U postgres
CREATE DATABASE stylebook_db;
CREATE USER stylebook_user WITH PASSWORD 'stylebook_password';
GRANT ALL PRIVILEGES ON DATABASE stylebook_db TO stylebook_user;
\c stylebook_db
GRANT ALL ON SCHEMA public TO stylebook_user;

# 2. Backend  (http://localhost:8080 — tables auto-create)
cd backend
mvn spring-boot:run

# 3. Mobile app
cd mobile
npm install --legacy-peer-deps
# put YOUR computer's IP in src/services/api.ts (API_BASE_URL)
npx expo start
# scan the QR with Expo Go — phone and computer on the same WiFi
```

Cloud-ready: all secrets/config are overridable via environment variables, and a `backend/Dockerfile` is included.

## Project structure

```
stylebook/
├── backend/    Spring Boot API — controllers / services / repositories / entities / DTOs
├── mobile/     Expo app — screens (auth, customer, owner) / navigation / contexts / api client
└── docs/       Project documents
```

## Roadmap

Mobile Money payments (Paystack) · staff-level booking calendars · push notifications via dev build · cloud deployment · map view · automated tests

---

*Built by **Adesina Elijah** — 2nd year project, 2026.*
