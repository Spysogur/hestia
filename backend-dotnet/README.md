# 🆘 Hestia API — C# .NET Backend

> Community Emergency Response System — named after the Greek goddess of the hearth and home.

## Architecture

Clean/Onion Architecture with four layers:

```
┌─────────────────────────────────────────┐
│  Hestia.API                             │  ← Controllers, Middleware, Swagger, Program.cs
│  ┌─────────────────────────────────┐    │
│  │  Hestia.Infrastructure          │    │  ← EF Core, Repositories, JWT, SignalR, BCrypt
│  │  ┌─────────────────────────┐    │    │
│  │  │  Hestia.Application     │    │    │  ← Use Cases, DTOs, FluentValidation, Interfaces
│  │  │  ┌─────────────────┐    │    │    │
│  │  │  │ Hestia.Domain   │    │    │    │  ← Entities, Enums, Repository Interfaces, MatchingService
│  │  │  └─────────────────┘    │    │    │
│  │  └─────────────────────────┘    │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

Dependencies point **inward only**. Domain has zero dependencies. Infrastructure implements the interfaces defined in Domain/Application.

## Tech Stack

| Component       | Technology                                    |
|-----------------|-----------------------------------------------|
| Framework       | .NET 9.0 / ASP.NET Core                       |
| Database        | PostgreSQL 16 + PostGIS 3.4                   |
| ORM             | Entity Framework Core 9 + Npgsql              |
| Auth            | JWT Bearer (System.IdentityModel.Tokens.Jwt)  |
| Passwords       | BCrypt.Net-Next                                |
| Validation      | FluentValidation                               |
| Real-time       | ASP.NET Core SignalR                           |
| API Docs        | Swagger / Swashbuckle                          |
| Containerization| Docker multi-stage build                       |

## Getting Started

### Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- PostgreSQL 16+ with PostGIS extension
- Docker & Docker Compose (optional)

### Quick Start with Docker

```bash
# From the project root (emergency-response/)
docker compose up -d postgres redis

# Run the .NET backend
cd backend-dotnet
dotnet run --project src/Hestia.API
```

### Manual Setup

```bash
# 1. Clone and navigate
cd backend-dotnet

# 2. Restore packages
dotnet restore

# 3. Update connection string in src/Hestia.API/appsettings.json

# 4. Run EF Core migrations
dotnet ef database update --project src/Hestia.Infrastructure --startup-project src/Hestia.API

# 5. Start the API
dotnet run --project src/Hestia.API
```

### Docker Build

```bash
docker build -t hestia-api .
docker run -p 5000:5000 \
  -e ConnectionStrings__DefaultConnection="Host=host.docker.internal;Port=5432;Database=hestia;Username=hestia;Password=hestia" \
  hestia-api
```

## API Documentation

Once running, open **Swagger UI**: [http://localhost:5000/swagger](http://localhost:5000/swagger)

The Swagger UI includes:
- Full endpoint documentation with XML comments
- Bearer token authentication (click "Authorize" and paste your JWT)
- Try-it-out for all endpoints
- Request/response schemas

## API Reference

### Authentication

| Method | Endpoint                  | Auth | Description              |
|--------|---------------------------|------|--------------------------|
| POST   | `/api/v1/auth/register`   | No   | Register a new user      |
| POST   | `/api/v1/auth/login`      | No   | Login, returns JWT token |

### Communities

| Method | Endpoint                          | Auth | Description                |
|--------|-----------------------------------|------|----------------------------|
| GET    | `/api/v1/communities`             | No   | List all communities       |
| GET    | `/api/v1/communities/nearby`      | No   | Find nearby communities    |
| POST   | `/api/v1/communities`             | Yes  | Create a community         |
| GET    | `/api/v1/communities/{id}`        | No   | Get community by ID        |
| POST   | `/api/v1/communities/{id}/join`   | Yes  | Join a community           |

### Emergencies

| Method | Endpoint                              | Auth | Description               |
|--------|---------------------------------------|------|---------------------------|
| GET    | `/api/v1/emergencies/active`          | No   | Get active emergencies    |
| POST   | `/api/v1/emergencies/activate`        | Yes  | Activate new emergency    |
| GET    | `/api/v1/emergencies/{id}`            | No   | Get emergency by ID       |
| PUT    | `/api/v1/emergencies/{id}/resolve`    | Yes  | Resolve an emergency      |
| PUT    | `/api/v1/emergencies/{id}/escalate`   | Yes  | Escalate severity         |

### Help Requests & Offers

| Method | Endpoint                                           | Auth | Description                    |
|--------|-----------------------------------------------------|------|-------------------------------|
| POST   | `/api/v1/help/requests`                             | Yes  | Create help request + matches |
| GET    | `/api/v1/help/requests/emergency/{emergencyId}`     | Yes  | Get requests for emergency    |
| POST   | `/api/v1/help/offers`                               | Yes  | Create help offer             |
| GET    | `/api/v1/help/offers/emergency/{emergencyId}`       | Yes  | Get offers for emergency      |
| POST   | `/api/v1/help/match/{requestId}/{offerId}`          | Yes  | Manual match                  |
| POST   | `/api/v1/help/auto-match/{emergencyId}`             | Yes  | Auto-match all open requests  |

### Health

| Method | Endpoint   | Auth | Description        |
|--------|------------|------|--------------------|
| GET    | `/health`  | No   | Health check       |

### Real-time (SignalR)

Connect to `/hubs/emergency` for live alerts:

```javascript
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/hubs/emergency")
    .build();

// Join community alerts
connection.invoke("JoinCommunity", communityId);

// Listen for alerts
connection.on("communityAlert", (data) => {
    console.log("Emergency alert:", data);
});
```

## Response Format

All responses follow a consistent envelope:

```json
// Success
{
    "status": "success",
    "data": { ... }
}

// Error
{
    "status": "error",
    "message": "Description of what went wrong"
}
```

## Configuration

Key settings in `appsettings.json`:

```json
{
    "ConnectionStrings": {
        "DefaultConnection": "Host=localhost;Port=5432;Database=hestia;Username=hestia;Password=hestia"
    },
    "JwtSettings": {
        "Secret": "your-secret-key-min-32-characters",
        "ExpiryHours": 24
    },
    "CorsSettings": {
        "AllowedOrigin": "http://localhost:3001"
    }
}
```

Environment variables override config (use `__` for nesting):
```bash
ConnectionStrings__DefaultConnection="Host=..."
JwtSettings__Secret="your-production-secret"
```

## Project Structure

```
backend-dotnet/
├── Hestia.sln
├── Dockerfile
├── README.md
└── src/
    ├── Hestia.Domain/           # Zero-dependency core
    │   ├── Entities/            # User, Community, Emergency, HelpRequest, HelpOffer, MapPin
    │   ├── Enums/               # All domain enums
    │   ├── Repositories/        # Repository interfaces
    │   └── Services/            # MatchingService (domain logic)
    ├── Hestia.Application/      # Application layer
    │   ├── DTOs/                # Request/Response DTOs + FluentValidation validators
    │   ├── Interfaces/          # IJwtService, IPasswordHasher, INotificationService
    │   └── UseCases/            # All use cases (RegisterUser, ActivateEmergency, etc.)
    ├── Hestia.Infrastructure/   # Infrastructure implementations
    │   ├── Auth/                # JwtService, BcryptPasswordHasher
    │   ├── Extensions/          # DI registration (ServiceCollectionExtensions)
    │   ├── Hubs/                # SignalR EmergencyHub
    │   ├── Notifications/       # SignalRNotificationService
    │   └── Persistence/         # HestiaDbContext + all EF Core repositories
    └── Hestia.API/              # Web host
        ├── Controllers/         # Auth, Communities, Emergencies, Help
        ├── Middleware/           # ExceptionMiddleware
        ├── Program.cs           # Startup/DI wiring
        └── appsettings.json     # Configuration
```

## License

MIT
