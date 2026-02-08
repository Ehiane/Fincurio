# Fincurio

> Your money, understood. A financial reflection tool with an editorial aesthetic.

<!-- Screenshot placeholder — replace with an actual screenshot of the app -->
<p align="center">
  <img src="docs/screenshot.png" alt="Fincurio Dashboard" width="900" />
</p>

## What is Fincurio?

Fincurio helps you track transactions, visualize spending patterns, and reflect on your relationship with money. It's not a typical fintech dashboard — it emphasizes calm, intentional awareness over reactive number-crunching.

**Live**: [getfincurio.com](https://www.getfincurio.com)

## Features

- **Onboarding** — Set a financial intention, choose your currency, define a monthly budget goal
- **Dashboard** — Balance overview, money flow chart (daily/weekly/monthly/yearly grouping), recent transactions
- **Journal** — Full transaction CRUD with date, category, merchant, and notes
- **Reflections** — Monthly insights with category breakdown and spending percentages
- **Settings** — Profile management, preferences, currency and timezone
- **Auth** — JWT access + refresh tokens, automatic token refresh, email verification, password reset

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 5, Vite, Tailwind CSS, Recharts, React Router v7 |
| **Backend** | ASP.NET Core (.NET 10), Entity Framework Core 10 |
| **Database** | PostgreSQL 17 |
| **Auth** | JWT Bearer + refresh tokens, BCrypt |
| **Email** | Resend |
| **Deployment** | Vercel (frontend) + Azure (backend) + Supabase (database) |

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Api Layer  │────▶│  Data Layer  │
│  React + TS  │     │  Controllers │     │  EF Core +   │
│              │     │  Middleware   │     │  PostgreSQL  │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────▼───────┐
                     │  Core Layer  │
                     │  Services    │
                     │  DTOs        │
                     │  Interfaces  │
                     └──────────────┘
```

**Backend follows strict three-layer separation**: Api → Core → Data. The Core layer contains all business logic, interfaces, and DTOs. Data access is abstracted behind the repository pattern.

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 1. Clone & setup database

```bash
git clone https://github.com/Ehiane/Fincurio.git
cd Fincurio

# Start PostgreSQL in Docker
docker run -d \
  --name fincurio-postgres \
  -e POSTGRES_DB=fincurio \
  -e POSTGRES_USER=fincurio_user \
  -e POSTGRES_PASSWORD=fincurio_dev_password \
  -p 5433:5432 \
  postgres:17
```

### 2. Start the backend

```bash
cd backend/src/Fincurio.Data
dotnet ef database update --startup-project ../Fincurio.Api

cd ../Fincurio.Api
dotnet run
# API: http://localhost:5109
# Swagger: http://localhost:5109/swagger
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
# App: http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/user/profile` | Get profile |
| PUT | `/api/user/profile` | Update profile |
| PUT | `/api/user/preferences` | Update preferences |
| GET | `/api/transactions` | List transactions (filterable, paginated) |
| GET | `/api/transactions/{id}` | Get transaction |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |
| GET | `/api/categories` | List categories |
| GET | `/api/insights/dashboard` | Dashboard data |
| GET | `/api/insights/monthly` | Monthly insights |

## Project Structure

```
fincurio/
├── backend/
│   └── src/
│       ├── Fincurio.Api/          # Controllers, middleware, config
│       ├── Fincurio.Core/         # Services, DTOs, interfaces, entities
│       └── Fincurio.Data/         # DbContext, repositories, migrations
├── frontend/
│   ├── pages/                     # Page components
│   ├── components/                # Shared UI components
│   └── src/
│       ├── api/                   # Axios API client
│       ├── contexts/              # Auth context
│       └── hooks/                 # Custom hooks
└── README.md
```

## Design

- **Palette**: Dark maroon `#280905`, warm orange `#E6501B`, cream `#f3efe9`
- **Typography**: Playfair Display (serif headings), Work Sans (body)
- **Philosophy**: Editorial magazine aesthetic — generous whitespace, calm transitions, reflection over reactivity

## Roadmap

- [ ] AI-generated financial insights
- [ ] Bank connections (Plaid)
- [ ] Recurring transactions
- [ ] Budget alerts and notifications
- [ ] CSV/PDF export
- [ ] Search and advanced filtering

## License

All rights reserved.

---

Built by [Ehiane](https://github.com/Ehiane) with help from Claude.
