# Fincurio Full-Stack Integration Plan

## Context

Fincurio is a financial reflection tool emphasizing calm, editorial-style UX over traditional fintech dashboards. The frontend React application exists with beautiful, polished UI (all pages built), but currently uses hardcoded data with no backend integration.

### Current State:
- Frontend: Vite + React 19 + TypeScript, all UI complete (Landing, SignIn, Onboarding, Dashboard, Journal, Reflections, Settings)
- No backend, no database, no API integration
- No version control (not a Git repo yet)
- Brand: Dark maroon (#280905) to warm orange (#E6501B) editorial aesthetic

### Goal:
Transform this into a working full-stack MVP with C# + ASP.NET Core backend, PostgreSQL database, JWT authentication, and seamless frontend integration while preserving the premium editorial UX.

### MVP Scope (Phase 1):
- ✅ JWT authentication with refresh tokens
- ✅ Manual transaction entry (no bank sync)
- ✅ Transaction history and filtering
- ✅ Basic monthly insights (aggregated from transactions)
- ✅ Category management
- ✅ User profile and preferences
- ❌ AI-generated insights (Phase 2)
- ❌ Bank connections/Plaid (Phase 2)
- ❌ Recurring transactions (Phase 2)

---

## Database Schema (MVP)

### Users Table

    ```sql
    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        profile_image_url TEXT,
        financial_intention TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_login_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE
    );

    CREATE INDEX idx_users_email ON users(email);
    ```

### Categories Table

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50),
    color VARCHAR(7),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed data matching frontend types.ts
INSERT INTO categories (name, display_name, type, icon, color, sort_order) VALUES
('Tech', 'Tech', 'expense', 'laptop_mac', '#E6501B', 1),
('Groceries', 'Nourishment', 'expense', 'restaurant', '#280905', 2),
('Salary', 'Salary', 'income', 'payments', '#10B981', 3),
('Dining', 'Dining', 'expense', 'local_cafe', '#F59E0B', 4),
('Subscription', 'Subscription', 'expense', 'music_note', '#8B5CF6', 5),
('Transport', 'Transport', 'expense', 'commute', '#3B82F6', 6),
('Shelter', 'Shelter', 'expense', 'home', '#6B7280', 7),
('Wellness', 'Wellness', 'expense', 'spa', '#EC4899', 8),
('Culture', 'Culture', 'expense', 'theater_comedy', '#14B8A6', 9);
```

### Transactions Table

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id),
    date DATE NOT NULL,
    time TIME,
    merchant VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
```

### User Preferences Table

```sql
### User Preferences Table

```sql
CREATE TABLE user_preferences (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
     currency VARCHAR(3) DEFAULT 'USD',
     timezone VARCHAR(50) DEFAULT 'UTC',
     monthly_budget_goal DECIMAL(12, 2),
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
 );
```

### Refresh Tokens Table

```sql
CREATE TABLE refresh_tokens (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     token VARCHAR(500) NOT NULL UNIQUE,
     expires_at TIMESTAMP NOT NULL,
     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
     revoked_at TIMESTAMP,
     is_revoked BOOLEAN DEFAULT FALSE
 );

 CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
 CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
```

### Relationships:
- Users (1) → (M) Transactions
- Users (1) → (1) UserPreferences
- Users (1) → (M) RefreshTokens
- Categories (1) → (M) Transactions

---

## API Contracts

### Authentication

#### POST /api/auth/register
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "Alex",
  "lastName": "Sterling"
}
```

**Response (201):**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "expiresIn": 3600
}
```

#### POST /api/auth/login
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "firstName": "Alex",
  "lastName": "Sterling",
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "expiresIn": 3600
}
```

#### POST /api/auth/refresh
**Request:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response (200):**
```json
{
  "accessToken": "new-jwt-token",
  "refreshToken": "new-refresh-token",
  "expiresIn": 3600
}
```

#### POST /api/auth/logout (requires JWT)
**Response (200):**
```json
{
  "message": "Successfully logged out"
}
```

### Transactions

#### GET /api/transactions
Query params: startDate, endDate, categoryId, type, page, pageSize

**Response (200):**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "date": "2024-10-24",
      "time": "10:42:00",
      "merchant": "Apple Store",
      "category": {
        "id": "uuid",
        "name": "Tech",
        "displayName": "Tech",
        "icon": "laptop_mac",
        "color": "#E6501B"
      },
      "amount": 2400.00,
      "type": "expense",
      "notes": null
    }
  ],
  "pagination": {
    "currentPage": 1,
    "pageSize": 50,
    "totalPages": 3,
    "totalItems": 142
  }
}
```

#### POST /api/transactions
**Request:**
```json
{
  "date": "2024-10-24",
  "time": "10:42",
  "merchant": "Apple Store",
  "categoryId": "uuid",
  "amount": 2400.00,
  "type": "expense",
  "notes": "MacBook Pro"
}
```

**Response (201):** {transaction object}

#### PUT /api/transactions/{id}
Update transaction

#### DELETE /api/transactions/{id}
Delete transaction (204 No Content)

### Categories

#### GET /api/categories
**Response (200):**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Tech",
      "displayName": "Tech",
      "type": "expense",
      "icon": "laptop_mac",
      "color": "#E6501B"
    }
  ]
}
```

### Insights

#### GET /api/insights/monthly?year=2024&month=10
**Response (200):**
```json
{
  "period": {
    "year": 2024,
    "month": 10,
    "displayName": "October 2024"
  },
  "summary": {
    "totalIncome": 5800.00,
    "totalExpenses": 4320.00,
    "netBalance": 1480.00,
    "changeFromPreviousMonth": 4.2
  },
  "categoryBreakdown": [
    {
      "category": {
        "id": "uuid",
        "name": "Shelter",
        "displayName": "Shelter",
        "icon": "home",
        "color": "#6B7280"
      },
      "amount": 1250.00,
      "transactionCount": 3,
      "percentOfTotal": 28.9
    }
  ]
}
```

#### GET /api/insights/dashboard
**Response (200):**
```json
{
  "currentBalance": 12450.00,
  "balanceChange": 4.2,
  "recentTransactions": [{...}],
  "monthlyFlow": [
    { "date": "2024-10-01", "income": 4000, "spending": 2400 }
  ]
}
```

### User Profile

#### GET /api/user/profile
**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "Alex",
  "lastName": "Sterling",
  "financialIntention": "security and freedom",
  "preferences": {
    "currency": "USD",
    "timezone": "America/New_York",
    "monthlyBudgetGoal": 4000.00
  }
}
```

#### PUT /api/user/profile
**Request:**
```json
{
  "firstName": "Alex",
  "lastName": "Sterling",
  "financialIntention": "calm and confidence"
}
```

**Response (200):** {updated profile}

#### PUT /api/user/preferences
**Request:**
```json
{
  "currency": "USD",
  "timezone": "America/New_York",
  "monthlyBudgetGoal": 4500.00
}
```

**Response (200):** {updated preferences}

---

## Backend Structure

### Project Layout

```
backend/
├── Fincurio.sln
└── src/
    ├── Fincurio.Api/              # Web API Layer
    │   ├── Controllers/
    │   │   ├── AuthController.cs
    │   │   ├── TransactionsController.cs
    │   │   ├── CategoriesController.cs
    │   │   ├── InsightsController.cs
    │   │   └── UserController.cs
    │   ├── Middleware/
    │   │   └── ExceptionHandlingMiddleware.cs
    │   ├── Program.cs
    │   ├── appsettings.json
    │   ├── appsettings.Development.json
    │   └── Fincurio.Api.csproj
    │
    ├── Fincurio.Core/             # Business Logic Layer
    │   ├── Interfaces/
    │   │   ├── Services/
    │   │   │   ├── IAuthService.cs
    │   │   │   ├── ITransactionService.cs
    │   │   │   ├── ICategoryService.cs
    │   │   │   ├── IInsightsService.cs
    │   │   │   ├── IUserService.cs
    │   │   │   └── ITokenService.cs
    │   │   └── Repositories/
    │   │       ├── IUserRepository.cs
    │   │       ├── ITransactionRepository.cs
    │   │       ├── ICategoryRepository.cs
    │   │       └── IRefreshTokenRepository.cs
    │   ├── Services/
    │   │   ├── AuthService.cs
    │   │   ├── TransactionService.cs
    │   │   ├── CategoryService.cs
    │   │   ├── InsightsService.cs
    │   │   ├── UserService.cs
    │   │   ├── TokenService.cs
    │   │   └── PasswordHasher.cs
    │   ├── Models/
    │   │   ├── Entities/
    │   │   │   ├── User.cs
    │   │   │   ├── Transaction.cs
    │   │   │   ├── Category.cs
    │   │   │   ├── UserPreference.cs
    │   │   │   └── RefreshToken.cs
    │   │   └── DTOs/
    │   │       ├── Auth/
    │   │       ├── Transaction/
    │   │       ├── Insight/
    │   │       └── User/
    │   ├── Exceptions/
    │   │   ├── NotFoundException.cs
    │   │   ├── UnauthorizedException.cs
    │   │   └── ValidationException.cs
    │   └── Fincurio.Core.csproj
    │
    └── Fincurio.Data/             # Data Access Layer
        ├── Context/
        │   └── FincurioDbContext.cs
        ├── Repositories/
        │   ├── UserRepository.cs
        │   ├── TransactionRepository.cs
        │   ├── CategoryRepository.cs
        │   └── RefreshTokenRepository.cs
        ├── Configurations/
        │   ├── UserConfiguration.cs
        │   ├── TransactionConfiguration.cs
        │   └── CategoryConfiguration.cs
        ├── Migrations/
        └── Fincurio.Data.csproj
```

### Key Configuration Files

#### backend/src/Fincurio.Api/appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=fincurio;Username=postgres;Password=your_password"
  },
  "Jwt": {
    "SecretKey": "your-256-bit-secret-key-minimum-32-characters",
    "Issuer": "Fincurio",
    "Audience": "FincurioClient",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

#### backend/.gitignore
```
bin/
obj/
*.user
*.suo
appsettings.Development.json
*.db
.vs/
.vscode/
```

---

## Frontend Integration

### Updated Structure

```
frontend/
├── src/
│   ├── api/                       # NEW - API client layer
│   │   ├── client.ts              # Axios instance with JWT interceptors
│   │   ├── auth.api.ts
│   │   ├── transactions.api.ts
│   │   ├── categories.api.ts
│   │   ├── insights.api.ts
│   │   └── user.api.ts
│   │
│   ├── contexts/                  # NEW - State management
│   │   └── AuthContext.tsx        # Auth state, login/logout/register
│   │
│   ├── hooks/                     # NEW - Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useTransactions.ts
│   │   ├── useCategories.ts
│   │   └── useInsights.ts
│   │
│   ├── utils/                     # NEW - Utilities
│   │   ├── formatters.ts          # Currency, date formatting
│   │   └── storage.ts             # localStorage helpers
│   │
│   ├── types/                     # REFACTOR - Move types.ts to folder
│   │   ├── index.ts
│   │   ├── api.types.ts
│   │   ├── transaction.types.ts
│   │   ├── auth.types.ts
│   │   └── user.types.ts
│   │
│   ├── components/                # UPDATE existing + add new
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── LoadingSpinner.tsx     # NEW
│   │   ├── PrivateRoute.tsx       # NEW
│   │   └── TransactionModal.tsx   # NEW
│   │
│   ├── pages/                     # UPDATE all with API integration
│   │   ├── Landing.tsx
│   │   ├── SignIn.tsx             # Connect to auth API
│   │   ├── Onboarding.tsx         # 3 steps: intention, currency, budget
│   │   ├── Dashboard.tsx          # Fetch from /api/insights/dashboard
│   │   ├── Journal.tsx            # Fetch/create/update transactions
│   │   ├── Reflections.tsx        # Fetch monthly insights
│   │   └── Settings.tsx           # Fetch/update profile
│   │
│   ├── App.tsx                    # Wrap with AuthProvider
│   ├── index.tsx
│   └── vite.config.ts             # Add proxy config
│
├── .env.development               # NEW
├── .env.production                # NEW
└── package.json                   # Add axios dependency
```

### Critical Frontend Files

#### frontend/src/api/client.ts
```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Add JWT token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = '/signin';
      }
    }

    return Promise.reject(error);
  }
);
```

#### frontend/src/contexts/AuthContext.tsx
```typescript
import { createContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth.api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        } catch {
          localStorage.clear();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setUser(response);
  };

  const register = async (data: RegisterData) => {
    const response = await authApi.register(data);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    setUser(response);
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### frontend/vite.config.ts (updated)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

#### frontend/.env.development
```
VITE_API_URL=http://localhost:5000
```

#### frontend/package.json (add dependency)
```json
{
  "dependencies": {
    "axios": "^1.6.0"
  }
}
```

---

## Implementation Sequence

### Step 1: Version Control Setup

```bash
# In project root
git init
git add .
git commit -m "Initial commit: React frontend prototype"
```

Create `.gitignore` in root:
```
# Frontend
frontend/node_modules/
frontend/dist/
frontend/.env.local
frontend/.env.development.local

# Backend
backend/bin/
backend/obj/
backend/**/*.user
backend/**/appsettings.Development.json

# Database
*.db

# IDE
.vs/
.vscode/
.idea/
```

### Step 2: Backend Scaffolding

```bash
# Create backend structure
cd backend
dotnet new sln -n Fincurio

# Create projects
dotnet new webapi -n Fincurio.Api -o src/Fincurio.Api
dotnet new classlib -n Fincurio.Core -o src/Fincurio.Core
dotnet new classlib -n Fincurio.Data -o src/Fincurio.Data

# Add to solution
dotnet sln add src/Fincurio.Api/Fincurio.Api.csproj
dotnet sln add src/Fincurio.Core/Fincurio.Core.csproj
dotnet sln add src/Fincurio.Data/Fincurio.Data.csproj

# Add project references
cd src/Fincurio.Api
dotnet add reference ../Fincurio.Core/Fincurio.Core.csproj

cd ../Fincurio.Core
dotnet add reference ../Fincurio.Data/Fincurio.Data.csproj

# Install packages
cd ../Fincurio.Data
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add package Microsoft.EntityFrameworkCore.Design

cd ../Fincurio.Api
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Swashbuckle.AspNetCore

cd ../Fincurio.Core
dotnet add package BCrypt.Net-Next
```

### Step 3: Database Setup

```bash
# Install PostgreSQL locally (if not installed)
# Create database
createdb fincurio
```

### Step 4: Backend Implementation Order

#### Day 1-2: Data Layer
1. Create entity models in Fincurio.Core/Models/Entities/
2. Create DTOs in Fincurio.Core/Models/DTOs/
3. Create FincurioDbContext.cs with entity configurations
4. Create initial migration: `dotnet ef migrations add InitialCreate`
5. Apply migration: `dotnet ef database update`
6. Create repository interfaces and implementations
7. Seed categories data

#### Day 3-4: Business Logic
1. Implement TokenService (JWT generation/validation)
2. Implement PasswordHasher (BCrypt)
3. Implement AuthService (register/login/refresh/logout)
4. Implement UserService (profile management)
5. Implement CategoryService (get categories)
6. Implement TransactionService (CRUD operations)
7. Implement InsightsService (aggregation logic)

#### Day 5-6: API Layer
1. Configure Program.cs (JWT, CORS, DI, middleware)
2. Create ExceptionHandlingMiddleware
3. Implement AuthController
4. Implement UserController
5. Implement CategoriesController
6. Implement TransactionsController
7. Implement InsightsController
8. Test all endpoints with Swagger

### Step 5: Frontend Integration Order

#### Day 7: API Client Setup
1. Install axios: `npm install axios`
2. Create src/api/client.ts with interceptors
3. Create API service files (auth, transactions, categories, insights, user)
4. Define TypeScript types for API requests/responses

#### Day 8: State Management
1. Create src/contexts/AuthContext.tsx
2. Create src/hooks/useAuth.ts
3. Create src/components/PrivateRoute.tsx
4. Wrap App.tsx with AuthProvider
5. Update routing to use PrivateRoute

#### Day 9-10: Page Updates
1. Update SignIn.tsx - connect to login API, error handling
2. Update Onboarding.tsx - 3 steps (intention, currency, budget), save to backend
3. Update Dashboard.tsx - fetch from /api/insights/dashboard
4. Update Journal.tsx - fetch transactions, add pagination
5. Create TransactionModal.tsx for adding/editing transactions
6. Update Reflections.tsx - fetch monthly insights
7. Update Settings.tsx - fetch/update user profile

#### Day 11: Polish
1. Add loading states (skeleton screens matching editorial style)
2. Add error handling and toast notifications
3. Test full user flow (register → onboarding → dashboard → add transaction)
4. Responsive testing
5. Cross-browser testing

---

## Critical Files to Create/Modify

### Backend (Create)

1. `backend/src/Fincurio.Data/Context/FincurioDbContext.cs` - Database context with all entities
2. `backend/src/Fincurio.Core/Services/AuthService.cs` - Authentication logic
3. `backend/src/Fincurio.Core/Services/TokenService.cs` - JWT generation/validation
4. `backend/src/Fincurio.Api/Program.cs` - App configuration (JWT, CORS, DI)
5. `backend/src/Fincurio.Api/Controllers/AuthController.cs` - Auth endpoints
6. `backend/src/Fincurio.Api/Controllers/TransactionsController.cs` - Transaction CRUD
7. `backend/src/Fincurio.Api/Controllers/InsightsController.cs` - Dashboard and monthly insights

### Frontend (Create/Modify)

1. `frontend/src/api/client.ts` - Axios instance with JWT refresh logic (CREATE)
2. `frontend/src/contexts/AuthContext.tsx` - Auth state management (CREATE)
3. `frontend/src/hooks/useAuth.ts` - Auth hook (CREATE)
4. `frontend/src/api/transactions.api.ts` - Transaction API calls (CREATE)
5. `frontend/src/pages/SignIn.tsx` - Connect to backend (MODIFY)
6. `frontend/src/pages/Dashboard.tsx` - Fetch real data (MODIFY)
7. `frontend/src/pages/Journal.tsx` - Transaction management (MODIFY)
8. `frontend/vite.config.ts` - Add proxy config (MODIFY)

---

## Development Workflow

### Terminal 1: Backend

```bash
cd backend/src/Fincurio.Api
dotnet watch run
# Runs on https://localhost:5001 (or http://localhost:5000)
```

### Terminal 2: Frontend

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
# Proxies /api/* to localhost:5000
```

### Database Migrations

```bash
# Create migration
cd backend/src/Fincurio.Data
dotnet ef migrations add MigrationName --startup-project ../Fincurio.Api

# Apply migration
dotnet ef database update --startup-project ../Fincurio.Api
```

---

## Design Preservation

### Editorial UX Principles:
- Maintain spacious layouts, calm transitions
- Use brand colors (maroon #280905 to orange #E6501B)
- Loading states: subtle skeleton screens (not aggressive spinners)
- Error messages: styled with Playfair Display headlines, soft surfaces
- Preserve existing Tailwind classes and animations

### Example Loading State:
```typescript
{isLoading ? (
  <div className="animate-pulse space-y-6">
    <div className="h-32 bg-white/5 rounded-lg"></div>
    <div className="h-64 bg-white/5 rounded-lg"></div>
  </div>
) : (
  <ActualContent />
)}
```

---

## Verification & Testing

### End-to-End User Flow Test

1. **Registration:**
   - Navigate to /signin
   - Click "Create account"
   - Register with email/password
   - Verify JWT token stored in localStorage
   - Redirect to onboarding

2. **Onboarding:**
   - Step 1: Enter financial intention
   - Step 2: Select currency (USD default)
   - Step 3: Set monthly budget goal
   - Submit → verify saved to backend
   - Redirect to dashboard

3. **Dashboard:**
   - Verify fetches from /api/insights/dashboard
   - Display current balance (calculated from transactions)
   - Show money flow chart
   - Display recent transactions

4. **Add Transaction:**
   - Navigate to Journal
   - Click "+" button
   - Fill transaction form (date, merchant, category, amount)
   - Submit → verify POST to /api/transactions
   - Verify transaction appears in list

5. **View Reflections:**
   - Navigate to Reflections
   - Select month/year
   - Verify fetches from /api/insights/monthly
   - Display category breakdown with percentages

6. **Update Profile:**
   - Navigate to Settings
   - Update name, financial intention
   - Save → verify PUT to /api/user/profile

7. **Logout:**
   - Click Sign Out
   - Verify token cleared from localStorage
   - Redirect to landing page

### API Testing with Swagger

- Navigate to http://localhost:5000/swagger
- Test each endpoint manually
- Verify 401 errors for protected routes without JWT
- Test token refresh flow

### Database Verification

```sql
-- Check user created
SELECT * FROM users WHERE email = 'test@example.com';

-- Check transactions
SELECT * FROM transactions WHERE user_id = 'user-uuid';

-- Check preferences
SELECT * FROM user_preferences WHERE user_id = 'user-uuid';
```

### Browser Testing

- Chrome (primary)
- Firefox
- Safari (if on Mac)
- Mobile responsive (375px, 768px, 1024px, 1440px)

---

## Success Criteria

MVP is complete when:
- ✅ User can register, login, logout
- ✅ JWT tokens refresh automatically
- ✅ User can complete 3-step onboarding
- ✅ Dashboard displays real aggregated data
- ✅ User can add, edit, delete transactions
- ✅ Journal page shows all transactions with pagination
- ✅ Reflections page shows monthly category breakdown
- ✅ Settings page allows profile updates
- ✅ All API calls have error handling
- ✅ Loading states maintain editorial aesthetic
- ✅ Mobile responsive on all pages
- ✅ Project is version controlled with Git

### Phase 2 Features (Not MVP):
- AI-generated insights with Gemini API
- Bank connection via Plaid
- Recurring transactions
- Budget alerts
- Export transactions to CSV