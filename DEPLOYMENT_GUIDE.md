# Fincurio MVP Deployment Guide - Option B+ (Free Tier Hybrid)

**Stack:**
- Frontend: Vercel (Free)
- Backend: Azure App Service F1 (Free)
- Database: Supabase (Free)
- Email: Resend (Already configured)
- Domain: Cloudflare (getfincurio.com)

**Total Cost: $0/month**

---

## Deployment Architecture

```
Frontend:  https://getfincurio.com         → Vercel
Backend:   https://api.getfincurio.com     → Azure App Service (Free F1)
Database:  PostgreSQL                      → Supabase (Free tier)
Email:     noreply@getfincurio.com         → Resend ✅ Already configured
```

---

# Part 1: Database Setup (Supabase)

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click **Start your project**
3. Sign up with GitHub (easiest)
4. Verify your email

## Step 2: Create Database Project

1. Click **New Project**
2. Fill in details:
   - **Name**: `fincurio-mvp`
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to your users (e.g., `US East` or `EU West`)
   - **Pricing Plan**: Free
3. Click **Create new project**
4. Wait ~2 minutes for provisioning

## Step 3: Get Connection String

1. In Supabase dashboard, click **Project Settings** (gear icon)
2. Click **Database** in sidebar
3. Scroll to **Connection string** section
4. Select **URI** tab
5. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
6. **Replace `[YOUR-PASSWORD]` with your actual database password**

**SAVE THIS CONNECTION STRING** - you'll need it for:
- Azure environment variables
- Running database migrations

---

# Part 2: Azure App Service Setup (Backend)

## Step 1: Create Azure Account

1. Go to https://portal.azure.com
2. Click **Start free** or **Sign in**
3. Sign up with Microsoft account (or GitHub)
4. You'll get **$200 free credit for 30 days** + free services for 12 months
5. Enter payment info (won't be charged on free tier)
6. Complete verification

## Step 2: Create App Service

1. In Azure Portal, click **Create a resource**
2. Search for **Web App**
3. Click **Create**

### Configure Basics Tab:
- **Subscription**: Azure for Students / Free Trial
- **Resource Group**: Click **Create new** → Name: `fincurio-mvp`
- **Name**: `fincurio-api` (becomes `fincurio-api.azurewebsites.net`)
- **Publish**: Code
- **Runtime stack**: .NET 10 (STS)
- **Operating System**: Linux
- **Region**: East US (or closest to you)

### Configure Pricing Tab:
- **Pricing plan**: Click **Explore pricing plans**
- Select **Free F1** (1 GB RAM, 60 min/day CPU)
- Click **Select**

4. Click **Review + create**
5. Click **Create**
6. Wait ~1-2 minutes for deployment

## Step 3: Configure App Service Environment Variables

Once deployment completes:

1. Click **Go to resource**
2. In left sidebar, click **Configuration**
3. Click **New application setting** for each variable below:

### Application Settings to Add:

| Name | Value | Notes |
|------|-------|-------|
| `ConnectionStrings__DefaultConnection` | `YOUR_SUPABASE_CONNECTION_STRING` | From Part 1 |
| `Jwt__SecretKey` | `scyVgw7V/VimMIOkuKKMYqPhh/DFixtpDiPOyr6qDkg=` | Generated secure key |
| `Jwt__Issuer` | `Fincurio` | |
| `Jwt__Audience` | `FincurioClient` | |
| `Jwt__AccessTokenExpirationMinutes` | `60` | |
| `Jwt__RefreshTokenExpirationDays` | `7` | |
| `Resend__ApiKey` | `re_HgsLT9Pz_2Ph4LcE1cyDAeuQf9qbVvjef` | Already configured |
| `Resend__FromEmail` | `noreply@getfincurio.com` | |
| `Frontend__Url` | `https://getfincurio.com` | |

**Note**: If you want a new JWT secret, generate one with:
```bash
openssl rand -base64 32
```

3. Click **Save** at the top
4. Click **Continue** when prompted

## Step 4: Get Publish Profile for GitHub Actions

1. In App Service overview page, click **Download publish profile** (top toolbar)
2. Save the `.PublishSettings` file
3. Open it with Notepad
4. Copy the entire XML content (Ctrl+A, Ctrl+C)

## Step 5: Add GitHub Secret

1. Go to https://github.com/Ehiane/Fincurio
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
6. Value: Paste the entire publish profile XML
7. Click **Add secret**

## Step 6: Deploy Backend

### Option A - Automatic (Recommended):
GitHub Actions will automatically deploy when you push changes to `backend/` folder.

### Option B - Manual Trigger:
1. Go to https://github.com/Ehiane/Fincurio
2. Click **Actions** tab
3. Click **Deploy Backend to Azure** workflow
4. Click **Run workflow** dropdown
5. Click green **Run workflow** button
6. Wait ~3-5 minutes for deployment

**Check deployment status:**
- Green checkmark = success
- Red X = failed (click to see logs)

---

# Part 3: Database Migrations

After backend is deployed, create database tables in Supabase.

## Run Migrations from Local Machine:

1. Open `backend/src/Fincurio.Api/appsettings.Development.json`
2. **Temporarily** replace the `DefaultConnection` with your Supabase connection string
3. Open terminal and run:
   ```bash
   cd backend/src/Fincurio.Data
   dotnet ef database update --startup-project ../Fincurio.Api
   ```
4. You should see:
   ```
   Applying migration '20260207xxxxxx_InitialCreate'.
   Applying migration '20260207xxxxxx_AddEmailVerificationAndPasswordReset'.
   Done.
   ```
5. **Revert** `appsettings.Development.json` back to localhost connection string
6. Save the file

**Verify in Supabase:**
1. Go to Supabase dashboard
2. Click **Table Editor**
3. You should see tables: `users`, `categories`, `transactions`, `user_preferences`, `refresh_tokens`

---

# Part 4: Vercel Frontend Setup

## Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Click **Sign Up**
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your repositories

## Step 2: Import Project

1. Click **Add New** → **Project**
2. Find **Fincurio** repository in the list
3. Click **Import**

### Configure Project Settings:

**Framework Preset**: Vite (should auto-detect)
**Root Directory**: `frontend` ← **IMPORTANT!**
**Build Command**: `npm run build` (auto-filled)
**Output Directory**: `dist` (auto-filled)
**Install Command**: `npm install` (auto-filled)

### Add Environment Variable:

Click **Environment Variables** section and add:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_URL` | `https://fincurio-api.azurewebsites.net` | Production |

3. Click **Deploy**
4. Wait ~2-3 minutes for deployment
5. You'll see "Congratulations!" when done

## Step 3: Note Your Vercel Domain

After deployment:
1. Your app will be live at: `fincurio-xxx.vercel.app` (random subdomain)
2. Click **Visit** to test it
3. You should see the Fincurio landing page

**Test basic functionality:**
- Try signing up (won't work until custom domain is configured)

---

# Part 5: Custom Domain Setup

## Step 1: Add Domain to Vercel

1. In Vercel project dashboard, click **Settings**
2. Click **Domains** in sidebar
3. Enter: `getfincurio.com`
4. Click **Add**
5. Vercel will show DNS records needed

### Vercel DNS Records (will be shown in UI):

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Don't close this tab** - keep it open to verify later

## Step 2: Configure Cloudflare DNS

1. Open new tab: https://dash.cloudflare.com
2. Click **getfincurio.com**
3. Click **DNS** in sidebar

### Add/Update These DNS Records:

| Type | Name | Target | TTL | Proxy Status |
|------|------|--------|-----|--------------|
| A | @ | 76.76.21.21 | Auto | DNS only (gray cloud) ☁️ |
| CNAME | www | cname.vercel-dns.com | Auto | DNS only (gray cloud) ☁️ |
| CNAME | api | fincurio-api.azurewebsites.net | Auto | DNS only (gray cloud) ☁️ |

**Critical**: Click the orange cloud ☁️ to make it gray for each record!

4. Click **Save** for each record

## Step 3: Verify Domain in Vercel

1. Go back to Vercel tab
2. Wait ~5-10 minutes for DNS propagation
3. Refresh the page
4. You should see: ✅ **Valid Configuration**
5. Vercel will automatically provision SSL certificate (takes 1-2 minutes)

**If verification fails:**
- Wait longer (DNS can take up to 30 minutes)
- Double-check DNS records in Cloudflare
- Ensure proxy is OFF (gray cloud)
- Click "Refresh" in Vercel

---

# Part 6: Configure Custom Domain in Azure

Now that `api.getfincurio.com` is set up:

1. Go to https://portal.azure.com
2. Find and open **fincurio-api** App Service
3. Click **Custom domains** in left sidebar
4. Click **Add custom domain**
5. Enter: `api.getfincurio.com`
6. Click **Validate**
7. You should see: "Domain ownership validated"
8. Click **Add**
9. Azure will auto-provision SSL certificate (~5 minutes)

**Verify:**
- Go to https://api.getfincurio.com
- You should see a simple page (or 404) - this confirms it's working
- Check for 🔒 padlock in browser (SSL working)

---

# Part 7: Update Frontend API URL

Now that custom domain works, update the API URL:

1. Go to Vercel project
2. Click **Settings** → **Environment Variables**
3. Find `VITE_API_URL`
4. Click **Edit**
5. Change value to: `https://api.getfincurio.com`
6. Click **Save**

### Redeploy Frontend:

7. Go to **Deployments** tab
8. Click **...** (three dots) on the latest deployment
9. Click **Redeploy**
10. Click **Redeploy** to confirm
11. Wait ~2 minutes

---

# Part 8: Test Your Deployment! 🎉

## Complete End-to-End Test:

### 1. Test Landing Page
- Go to **https://getfincurio.com**
- Should load without errors
- Check for 🔒 SSL padlock

### 2. Test Registration
- Click **Sign In** → **Create account**
- Register with your email:
  - Email: your-email@example.com
  - Password: Test123!@#
  - First Name: Test
  - Last Name: User
- Click **Create Account**

### 3. Test Email Verification
- Check your email inbox
- Look for email from **noreply@getfincurio.com**
- Click **Verify Email Address** button
- Should see "Email Verified!" success page
- Auto-redirect to sign in page

### 4. Test Sign In
- Sign in with your credentials
- Should redirect to dashboard

### 5. Test Onboarding
- Step 1: Enter financial intention (e.g., "Building wealth")
- Step 2: Select currency (USD)
- Step 3: Set monthly budget (e.g., $4000)
- Complete onboarding
- Should see dashboard

### 6. Test Dashboard
- Should see $0.00 balance
- Empty transaction list
- "Add Your First Transaction" message

### 7. Test Add Transaction
- Click **Journal** in sidebar
- Click **+** button
- Fill in transaction:
  - Date: Today
  - Merchant: Test Store
  - Category: Groceries
  - Amount: 50.00
  - Type: Expense
- Click **Add Transaction**
- Should see transaction in list

### 8. Test Monthly Insights
- Click **Reflections** in sidebar
- Should see current month
- Should show total expenses: $50.00
- Category breakdown should show Groceries

### 9. Test Profile Update
- Click **Settings** in sidebar
- Update first name to something else
- Click **Save Changes**
- Should see success message
- Check sidebar - name should update

### 10. Test Logout
- Click **Sign Out** at bottom of sidebar
- Should redirect to landing page
- Try accessing `/app/dashboard` directly
- Should redirect to sign in (protected route)

---

## Deployment Checklist

**Database (Supabase):**
- [ ] Account created
- [ ] Project created
- [ ] Connection string saved
- [ ] Tables verified in Table Editor

**Backend (Azure):**
- [ ] Azure account created
- [ ] App Service created (fincurio-api)
- [ ] All environment variables configured
- [ ] Publish profile downloaded
- [ ] GitHub secret added
- [ ] Deployment successful (green checkmark)
- [ ] Database migrations run
- [ ] Custom domain added (api.getfincurio.com)
- [ ] SSL certificate provisioned

**Frontend (Vercel):**
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Build successful
- [ ] Environment variable added
- [ ] Custom domain added (getfincurio.com)
- [ ] DNS verified
- [ ] SSL certificate provisioned
- [ ] API URL updated to custom domain
- [ ] Redeployed with new API URL

**DNS (Cloudflare):**
- [ ] A record for @ → 76.76.21.21
- [ ] CNAME for www → cname.vercel-dns.com
- [ ] CNAME for api → fincurio-api.azurewebsites.net
- [ ] All records set to DNS only (gray cloud)

**End-to-End Testing:**
- [ ] Landing page loads
- [ ] Registration works
- [ ] Email verification received and works
- [ ] Login works
- [ ] Onboarding completes
- [ ] Dashboard loads
- [ ] Add transaction works
- [ ] Monthly insights show data
- [ ] Profile update works
- [ ] Logout works

---

## Troubleshooting Common Issues

### Backend Not Deploying
**Error**: GitHub Actions deployment fails
**Solution**:
1. Check GitHub Actions logs for specific error
2. Verify publish profile secret is correct
3. Ensure Azure App Service is running (not stopped)
4. Check Azure logs: App Service → Monitoring → Log stream

### Database Connection Error
**Error**: "Failed to connect to database"
**Solution**:
1. Verify Supabase connection string is correct in Azure settings
2. Check Supabase project is active (not paused)
3. Ensure `__` (double underscore) is used in Azure config name
4. Restart App Service: Overview → Restart

### CORS Error on Frontend
**Error**: "Access to fetch blocked by CORS policy"
**Solution**:
1. Check `Frontend__Url` in Azure matches your Vercel domain
2. Restart Azure App Service after changing env vars
3. Verify no typos in domain name

### Email Not Sending
**Error**: "Failed to send verification email"
**Solution**:
1. Verify Resend API key is correct in Azure settings
2. Check domain is verified in Resend dashboard
3. Ensure email is from `noreply@getfincurio.com`
4. Check Azure logs for Resend API errors

### Domain Not Resolving
**Error**: "This site can't be reached"
**Solution**:
1. Wait 30 minutes for DNS propagation
2. Check DNS records in Cloudflare are correct
3. Ensure proxy is OFF (gray cloud)
4. Use https://dnschecker.org to verify DNS globally
5. Clear browser cache (Ctrl+Shift+Delete)

### SSL Certificate Error
**Error**: "Your connection is not private"
**Solution**:
1. Wait for certificate provisioning (can take 10 minutes)
2. Verify domain ownership in Vercel/Azure
3. Check DNS records are correct
4. Try in incognito/private browsing mode

---

## Post-Deployment Maintenance

### Monitoring
- **Azure**: Check App Service → Monitoring → Metrics
- **Vercel**: Check project → Analytics
- **Supabase**: Check project → Database → Usage

### Updating Code
- **Backend**: Push to `main` branch, GitHub Actions auto-deploys
- **Frontend**: Push to `main` branch, Vercel auto-deploys

### Free Tier Limits to Watch
- **Azure**: 60 CPU minutes/day (resets daily)
- **Supabase**: 500MB database, 2GB bandwidth/month
- **Vercel**: 100GB bandwidth/month
- **Resend**: 3,000 emails/month, 100 emails/day

### When to Upgrade
- Azure CPU minutes exceeded daily
- Supabase approaching 500MB
- Consistent traffic growth
- Need better performance

---

## Success! 🎉

Your Fincurio MVP is now live at:
- **Frontend**: https://getfincurio.com
- **Backend API**: https://api.getfincurio.com
- **Total Cost**: $0/month

Share the link and start testing with real users!

---

## Next Steps (Post-MVP)

1. **Analytics**: Add Google Analytics or Vercel Analytics
2. **Monitoring**: Set up error tracking (Sentry)
3. **Testing**: Add users and gather feedback
4. **Performance**: Monitor load times and optimize
5. **Features**: Plan Phase 2 features based on user feedback

---

**Need help?** Issues or questions during deployment:
- Check GitHub Actions logs for backend errors
- Check Vercel deployment logs for frontend errors
- Check Azure Log Stream for runtime errors
- Check browser console for frontend errors

**Deployment prepared by**: Claude Sonnet 4.5
**Date**: February 7, 2026
**Project**: Fincurio MVP - Financial Reflection Tool
