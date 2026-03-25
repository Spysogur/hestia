# 🆘 Hestia — Community Emergency Response System

> *Named after the Greek goddess of the hearth and home — because community protection starts at home.*

## Vision
A platform that enables communities to self-organize before, during, and after emergencies. When official channels are slow or down, communities save themselves.

## Architecture
Hestia follows **Onion Architecture** (Clean Architecture) — domain logic at the core, infrastructure at the edges. Every layer depends inward, never outward.

```
┌─────────────────────────────────────────┐
│           Infrastructure                │
│  (DB, APIs, Notifications, Maps)        │
│  ┌─────────────────────────────────┐    │
│  │        Application              │    │
│  │  (Use Cases, App Services)      │    │
│  │  ┌─────────────────────────┐    │    │
│  │  │      Domain              │    │    │
│  │  │  (Entities, Value Objs,  │    │    │
│  │  │   Domain Services,       │    │    │
│  │  │   Repository Interfaces) │    │    │
│  │  └─────────────────────────┘    │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## Tech Stack
- **Backend:** C# .NET 9.0 (ASP.NET Core) — `backend-dotnet/`
- **Backend (legacy):** Node.js + TypeScript + Express — `backend/`
- **Database:** PostgreSQL + PostGIS (geospatial)
- **Frontend:** React Native (mobile) + Next.js (web)
- **Real-time:** Socket.io
- **Maps:** OpenStreetMap / Mapbox
- **Offline:** Service Workers, IndexedDB
- **Notifications:** FCM + Twilio SMS

## Getting Started
```bash
# Backend (.NET)
cd backend-dotnet && dotnet run --project src/Hestia.API
# Swagger UI: http://localhost:5000/swagger

# Backend (Node.js — legacy)
cd backend && npm install && npm run dev

# Web Frontend
cd frontend/web && npm install && npm run dev

# Mobile
cd frontend/mobile && npm install && npx expo start
```

## License
MIT
