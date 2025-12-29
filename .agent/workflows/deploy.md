---
description: Deploy Progressly to Vercel (Production)
---
# Deployment Guide: Progressly

This guide steps through deploying your Next.js application to Vercel with a production Postgres database (e.g., Neon).

## 1. Prerequisites
- **GitHub Account**: Your code must be pushed to a repository.
- **Vercel Account**: For hosting the application.
- **Neon / Supabase / Postgres Provider**: For the production database.

## 2. Prepare the Codebase for Production

### Update Database Provider
Your local environment uses SQLite, but production requires Postgres.
1. Open `prisma/schema.prisma`.
2. Change the provider from `"sqlite"` to `"postgresql"`.
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   > **Note**: For local development, you can keep using SQLite if you don't commit this change, OR switch to a local Postgres instance. The best practice is to use the same DB type in dev and prod.

### Push to GitHub
Ensure all your latest changes are committed and pushed to your remote repository.

## 3. Set Up Production Database (Neon Example)
1. Go to [Neon.tech](https://neon.tech) and create a new project.
2. Copy the **Connection String** (Pooled connection string is recommended for serverless apps).
   - Format: `postgres://user:password@endpoint.neon.tech/neondb?sslmode=require`

## 4. Deploy to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** -> **"Project"**.
3. Import your `Progressly` GitHub repository.
4. **Configure Project**:
   - **Framework Preset**: Next.js (Default)
   - **Root Directory**: `./` (Default)
   - **Build Command**: `next build` (Default)
   - **Environment Variables**: Expand this section and add:
     - `DATABASE_URL`: (Paste your Neon connection string)
     - `AUTH_SECRET`: (Generate a secure string via `openssl rand -base64 32` or an online generator)
     - `AUTH_URL`: (Set to your Vercel URL, e.g. `https://your-project.vercel.app`. *Note: On initial deploy, Vercel might auto-configure this, but it's good to be explicit once you know the URL.*)

5. Click **Deploy**.

## 5. Post-Deployment Database Setup
The build step `postinstall` script (if you add it) or Vercel's build process will generate the Prisma Client. However, you need to push your schema to the new DB.

1. Go to the Vercel Project Dashboard.
2. Navigate to the **Settings** > **General** > **Build & Development Settings**.
3. Change the **Build Command** to:
   ```bash
   npx prisma migrate deploy && next build
   ```
   *This ensures that every time you deploy, the database schema is automatically updated.*

   **Alternative (Manual)**:
   Run this locally if you have the production DB URL:
   ```bash
   npx prisma migrate deploy
   ```
   (You would need to temporarily set your `.env` to the production URL).

## 6. Verify Deployment
1. Visit your new Vercel URL.
2. Sign up as a new user (since your prod DB is empty).
3. Verify basic flows (Dashboard access, Profile creation).

## Troubleshooting
- **500 Errors**: Check Vercel **Logs** tab. Usually indicates missing env vars (e.g. `AUTH_SECRET`).
- **Database Errors**: Ensure you switched `schema.prisma` to `postgresql` before deploying!
