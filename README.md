# Fincurio - Financial Reflection Tool

> A full-stack financial management application with an editorial aesthetic, emphasizing calm reflection over traditional fintech dashboards.

**Status**: 🎉 MVP Phase 1 Complete - Fully Functional

## Overview

Fincurio is a financial reflection tool that helps users track transactions, view insights, and maintain awareness of their spending patterns through a beautiful, calm interface. Unlike traditional fintech apps, Fincurio emphasizes the "why" behind financial decisions through features like "financial intention" tracking.

## Tech Stack

### Backend
- **Framework**: ASP.NET Core 10 (.NET 10)
- **Database**: PostgreSQL 17 (Docker)
- **ORM**: Entity Framework Core 10
- **Authentication**: JWT Bearer tokens with refresh tokens
- **Security**: BCrypt password hashing (workFactor: 12)
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React 19
- **Language**: TypeScript 5
- **Build Tool**: Vite 6
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Styling**: Tailwind CSS (editorial theme)

### Architecture
- **Backend**: Three-layer architecture (Api → Core → Data)
- **Pattern**: Repository pattern for data access
- **State Management**: React Context API
- **API Design**: RESTful with JWT authentication

## MVP Features (Phase 1) ✅

### Authentication & Onboarding
- ✅ User registration and login
- ✅ JWT authentication with automatic token refresh
- ✅ 3-step onboarding flow:
  1. Financial intention (emotional goal)
  2. Currency selection (USD, EUR, GBP, JPY, CAD)
  3. Monthly budget goal

### Dashboard
- ✅ Current balance display with month-over-month change
- ✅ Money flow chart (last 30 days, grouped by week)
- ✅ Recent transactions list (last 5)
- ✅ Dynamic insights based on real data

### Transaction Management (Journal)
- ✅ Add transactions (income/expense)
- ✅ Edit existing transactions
- ✅ Delete transactions
- ✅ Date and time tracking
- ✅ Category assignment with icons
- ✅ Optional notes
- ✅ Transactions grouped by date (Today, Yesterday, etc.)

### Monthly Insights (Reflections)
- ✅ Category breakdown with percentages
- ✅ Month/year selector
- ✅ Summary stats (income, expenses, net balance)
- ✅ Visual progress bars
- ✅ Transaction counts per category

### Settings
- ✅ Profile management (name, financial intention)
- ✅ Preferences (currency, timezone, budget goal)
- ✅ Logout functionality

### UX Features
- ✅ Loading states with skeleton screens
- ✅ Error handling with retry options
- ✅ Empty states with calls-to-action
- ✅ Form validation
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ Editorial aesthetic preserved throughout

## Database Schema

### Tables
- **users**: User accounts with authentication
- **user_preferences**: Currency, timezone, budget settings
- **transactions**: Financial transactions with categories
- **categories**: Pre-seeded categories (9 total)
- **refresh_tokens**: JWT refresh token management

### Seeded Categories
1. Tech - Tech purchases
2. Groceries - Nourishment
3. Salary - Income
4. Dining - Dining out
5. Subscription - Recurring subscriptions
6. Transport - Commute & travel
7. Shelter - Housing costs
8. Wellness - Health & fitness
9. Culture - Events, books & art

## Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (for PostgreSQL)
- [Git](https://git-scm.com/)

### 1. Clone Repository
```bash
git clone https://github.com/Ehiane/Fincurio.git
cd fincurio
```

### 2. Setup Database (PostgreSQL in Docker)
```bash
docker run -d \
  --name fincurio-postgres \
  -e POSTGRES_DB=fincurio \
  -e POSTGRES_USER=fincurio_user \
  -e POSTGRES_PASSWORD=fincurio_dev_password \
  -p 5433:5432 \
  postgres:17

# Verify it's running
docker ps --filter "name=fincurio-postgres"
```

### 3. Setup Backend
```bash
cd backend/src/Fincurio.Api

# Restore dependencies
dotnet restore

# Run migrations
cd ../Fincurio.Data
dotnet ef database update --startup-project ../Fincurio.Api

# Start the API
cd ../Fincurio.Api
dotnet run
```

The API will be available at:
- **API**: http://localhost:5109
- **Swagger UI**: http://localhost:5109/swagger

### 4. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend will be available at: **http://localhost:3000**

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/preferences` - Update preferences

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `GET /api/transactions/{id}` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Categories
- `GET /api/categories` - List all categories

### Insights
- `GET /api/insights/dashboard` - Dashboard data
- `GET /api/insights/monthly?year={year}&month={month}` - Monthly insights

## Configuration

### Backend Configuration
Edit `backend/src/Fincurio.Api/appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=fincurio;Username=fincurio_user;Password=fincurio_dev_password"
  },
  "Jwt": {
    "SecretKey": "your-secret-key-here-minimum-32-characters",
    "Issuer": "Fincurio",
    "Audience": "FincurioClient",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  }
}
```

### Frontend Configuration
Edit `frontend/.env.development`:
```
VITE_API_URL=http://localhost:5109
```

## Testing the Application

### End-to-End User Flow
1. **Register**: Navigate to http://localhost:3000, click sign up
2. **Onboarding**: Complete 3 steps (intention → currency → budget)
3. **Dashboard**: View empty state with $0 balance
4. **Add Transaction**: Click + button in Journal
5. **View Insights**: Check Reflections page
6. **Edit Profile**: Update name in Settings
7. **Logout**: Sign out from sidebar

### Testing with Swagger
1. Navigate to http://localhost:5109/swagger
2. Register a user via `/api/auth/register`
3. Copy the `accessToken` from response
4. Click "Authorize" button, enter: `Bearer {your-token}`
5. Test all endpoints

## Project Structure

```
fincurio/
├── backend/
│   ├── Fincurio.sln                    # Solution file
│   └── src/
│       ├── Fincurio.Api/               # Web API layer
│       │   ├── Controllers/            # REST API controllers
│       │   ├── Middleware/             # Exception handling
│       │   └── Program.cs              # App configuration
│       ├── Fincurio.Core/              # Business logic
│       │   ├── Interfaces/             # Service & repository interfaces
│       │   ├── Services/               # Business logic implementation
│       │   ├── Models/                 # Entities & DTOs
│       │   └── Exceptions/             # Custom exceptions
│       └── Fincurio.Data/              # Data access
│           ├── Context/                # EF DbContext
│           ├── Repositories/           # Data access implementation
│           └── Migrations/             # EF migrations
├── frontend/
│   ├── src/
│   │   ├── api/                        # API client layer
│   │   ├── contexts/                   # React contexts (Auth)
│   │   ├── hooks/                      # Custom hooks (useAuth)
│   │   └── ...
│   ├── components/                     # Reusable components
│   ├── pages/                          # Page components
│   └── types.ts                        # TypeScript types
└── README.md                           # This file
```

## Key Design Decisions

### Editorial Aesthetic
- **Colors**: Dark maroon (#280905) to warm orange (#E6501B)
- **Typography**: Playfair Display (serif) for headlines, sans-serif for body
- **Spacing**: Generous whitespace, calm transitions
- **Philosophy**: Reflection over reactivity, clarity over complexity

### Authentication Flow
1. User registers/logs in → receives access token (60min) + refresh token (7 days)
2. Access token stored in localStorage
3. Axios interceptor adds token to all requests
4. On 401 error → automatic refresh with refresh token
5. New tokens stored, request retried
6. On refresh failure → logout, redirect to signin

### Transaction Management
- Transactions are user-scoped (only see your own)
- Categories are global (shared across users)
- Date/time tracked separately for flexibility
- Type field determines income vs expense
- Soft validation (amount > 0, required fields)

## Development Tips

### Backend
- **Build**: `cd backend && dotnet build`
- **Watch mode**: `cd backend/src/Fincurio.Api && dotnet watch run`
- **Migrations**: `cd backend/src/Fincurio.Data && dotnet ef migrations add Name --startup-project ../Fincurio.Api`
- **Update DB**: `dotnet ef database update --startup-project ../Fincurio.Api`

### Frontend
- **Dev server**: `cd frontend && npm run dev`
- **Build**: `npm run build`
- **Type check**: `tsc --noEmit`

### Docker Commands
- **Start**: `docker start fincurio-postgres`
- **Stop**: `docker stop fincurio-postgres`
- **Logs**: `docker logs fincurio-postgres`
- **Shell**: `docker exec -it fincurio-postgres psql -U fincurio_user -d fincurio`

## Known Issues & Limitations

### MVP Scope
- No AI-generated insights (Phase 2)
- No bank connections/Plaid integration (Phase 2)
- No recurring transactions (Phase 2)
- No budget alerts (Phase 2)
- No CSV export (Phase 2)
- Pagination on frontend not fully implemented (returns all transactions)
- No search functionality on Journal page

### Minor Issues
- One nullable warning in DbContext (safe to ignore)
- CRLF line ending warnings in Git (cosmetic)

## Phase 2 Roadmap

### Planned Features
- 🔮 AI-generated financial insights using Gemini API
- 🏦 Bank account connection via Plaid
- 🔄 Recurring transactions
- 📊 Advanced analytics and forecasting
- 📧 Budget alerts and notifications
- 📥 CSV/PDF export
- 🔍 Search and advanced filtering
- 📱 Mobile app (React Native)

## Contributing

This is a personal project, but feedback is welcome! Open an issue on GitHub for bugs or feature requests.

## License

This project is for educational purposes. All rights reserved.

## Acknowledgments

- Built with guidance from Claude (Anthropic)
- Design inspired by editorial and magazine layouts
- Financial philosophy: "Money reflected, not just tracked"

---

**🎉 MVP Complete!** Ready for user testing and Phase 2 planning.

For questions or issues: https://github.com/Ehiane/Fincurio/issues
