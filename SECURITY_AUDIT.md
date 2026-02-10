# Fincurio Security Audit & Improvement Plan

> **Date**: February 9, 2026
> **Context**: Answering "What did you do to secure the website since it would contain confidential data?"

---

## Current Security Measures (What's Already Done)

### Authentication & Password Security
- **BCrypt password hashing** with work factor 12 (industry-standard, computationally expensive to brute-force)
- **JWT tokens** with proper validation: issuer, audience, lifetime, signing key all verified
- **Zero clock skew** on token expiration (no grace period for expired tokens)
- **Refresh token rotation**: old tokens are revoked on each refresh, preventing token reuse
- **Logout revokes ALL refresh tokens** for the user (kills all sessions)
- **Secure random token generation** using `RandomNumberGenerator` for email verification and password reset tokens

### Authorization & Access Control
- **All data endpoints require authentication** via `[Authorize]` attribute (Transactions, Categories, Insights, User)
- **User-scoped data access**: every database query filters by `userId` — users can never access another user's data
- **Claims-based identity**: userId extracted from JWT claims, not from request parameters (prevents IDOR attacks)

### SQL Injection Protection
- **Entity Framework Core ORM** used exclusively — all queries are parameterized automatically
- **Zero raw SQL queries** in the codebase

### XSS Protection
- **React's default escaping** handles all rendered content safely
- **No `dangerouslySetInnerHTML`** usage anywhere in the app
- **No `eval()` or string-based `setTimeout`** usage

### Error Handling
- **Exception handling middleware** catches all errors
- **Production mode**: returns generic "An internal server error occurred" (no stack traces leaked)
- **Development mode only**: shows detailed error info
- **Custom exception types** (NotFoundException, UnauthorizedException, ValidationException) return appropriate HTTP status codes

### Input Validation
- **Backend data annotations**: `[Required]`, `[EmailAddress]`, `[MinLength]`, `[Range]`, `[RegularExpression]` on all DTOs
- **Transaction type enforcement**: regex `^(income|expense)$` prevents arbitrary values
- **Client-side validation** for UX (password strength, email format, budget amounts)

### Account Security Features
- **Email verification** with 24-hour expiry tokens
- **Password reset** with 1-hour expiry tokens (all sessions revoked after reset)
- **Email enumeration prevention**: forgot-password always returns the same message regardless of whether the email exists
- **Account active/inactive status** checking on login
- **Last login timestamp** tracking

### HTTPS & CORS
- **HTTPS redirection** enabled
- **CORS policy** restricts origins to localhost (dev) and specific production domains
- **Credentials mode** properly configured

### Route Protection (Frontend)
- **PrivateRoute component** guards all authenticated pages
- **Token refresh on 401** with automatic retry
- **Redirect to sign-in** when tokens expire completely

---

## Security Gaps Identified

### CRITICAL
1. **Secrets in version control** — JWT secret key, database password, and Resend API key are in `appsettings.Development.json` and `.env` files that may be committed to Git
2. **API key exposed in frontend bundle** — `GEMINI_API_KEY` is injected into client-side JavaScript via Vite's `define` config (visible to anyone inspecting the page)
3. **Tokens stored in localStorage** — vulnerable to XSS extraction; if any XSS vulnerability is ever introduced, attacker can steal all tokens

### HIGH
4. **No rate limiting** — login, register, password reset endpoints have no throttling (vulnerable to brute-force attacks)
5. **No security headers** — missing HSTS, X-Frame-Options, X-Content-Type-Options, Content-Security-Policy, Referrer-Policy
6. **No CSRF protection** — relies solely on Bearer token auth (acceptable for API-only, but defense-in-depth is better)

### MEDIUM
7. **Password minimum length mismatch** — backend requires 6 chars, frontend requires 8 chars with complexity rules; backend should match frontend's stricter rules
8. **Financial data in logs** — transaction amounts are logged without masking
9. **Dev server binds to 0.0.0.0** — exposes dev server to entire local network
10. **Heavy CDN reliance without SRI** — external scripts loaded without Subresource Integrity hashes

---

## Recommended Next Steps

### Phase 1: Immediate Fixes (Critical)

#### 1. Rotate & Secure All Secrets
- Move JWT secret, DB connection string, and API keys to environment variables / .NET User Secrets
- Add `appsettings.Development.json`, `.env`, and `.env.local` to `.gitignore`
- **Rotate all exposed credentials** (they're compromised if ever pushed to Git)
- **Files**: `backend/src/Fincurio.Api/appsettings.Development.json`, `backend/.env`, `frontend/.env.local`

#### 2. Remove API Key from Frontend
- Remove `GEMINI_API_KEY` from `vite.config.ts` `define` block
- If AI features are needed, proxy through backend
- **Files**: `frontend/vite.config.ts`

#### 3. Align Password Validation
- Update backend `RegisterRequestDto` to require 8+ chars with complexity rules matching frontend
- **Files**: `backend/src/Fincurio.Core/DTOs/Auth/RegisterRequestDto.cs`

### Phase 2: High-Priority Hardening

#### 4. Add Rate Limiting
- Use .NET's built-in rate limiting middleware
- Apply strict limits: `/api/auth/login` (5/min), `/api/auth/register` (3/min), `/api/auth/forgot-password` (3/min)
- Apply general limits to all other endpoints (100/min)
- **Files**: `backend/src/Fincurio.Api/Program.cs`

#### 5. Add Security Headers Middleware
- HSTS (`Strict-Transport-Security`)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` (restrict scripts, styles, fonts to known origins)
- **Files**: `backend/src/Fincurio.Api/Program.cs` or new middleware class

#### 6. Add Account Lockout
- Track failed login attempts per email
- Lock account after 5 failed attempts for 15 minutes
- **Files**: `backend/src/Fincurio.Core/Services/AuthService.cs`, potentially new entity

### Phase 3: Defense-in-Depth (Medium Priority)

#### 7. Move Tokens to HttpOnly Cookies (Optional but recommended)
- Store refresh tokens in HttpOnly, Secure, SameSite=Strict cookies
- Keep access tokens in memory only (not localStorage)
- Eliminates token theft via XSS entirely
- **Files**: Multiple backend + frontend files

#### 8. Mask Sensitive Data in Logs
- Remove or mask transaction amounts from log messages
- **Files**: `backend/src/Fincurio.Core/Services/TransactionService.cs`

#### 9. Add Subresource Integrity (SRI)
- Add `integrity` attributes to external CDN script/link tags
- **Files**: `frontend/index.html`

---

## Quick Answer Summary

When asked **"What did you do to secure the website?"**, you can say:

> "We implemented BCrypt password hashing (work factor 12), JWT authentication with refresh token rotation, HTTPS enforcement, user-scoped data isolation at the database layer, SQL injection protection via ORM, XSS protection through React's built-in escaping, input validation on both client and server, email verification, brute-force-resistant password reset flows with email enumeration prevention, CORS restrictions, and environment-based error handling that hides internals in production. Next steps include adding rate limiting, security headers, and migrating secrets to secure storage."

---

## Verification Checklist
- [ ] Run `npm audit` in frontend for dependency vulnerabilities
- [ ] Run `dotnet list package --vulnerable` in backend for .NET vulnerabilities
- [ ] Test rate limiting after implementation
- [ ] Verify security headers via browser DevTools or securityheaders.com
- [ ] Confirm secrets are not in Git history
- [ ] Verify GEMINI_API_KEY is not in the built frontend bundle
