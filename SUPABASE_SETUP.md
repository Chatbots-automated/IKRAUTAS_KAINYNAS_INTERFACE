# Supabase Setup Guide

This guide will help you set up your self-hosted Supabase database for the Kainynas application.

## Prerequisites

- Self-hosted Supabase instance running
- Environment variables configured in `.env.local`

## Step 1: Apply Database Migration

The migration file is located at: `supabase/migrations/20260220000000_initial_schema.sql`

### Option A: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

### Option B: Manual SQL Execution

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of `supabase/migrations/20260220000000_initial_schema.sql`
4. Paste and execute the SQL

This will create the following tables:
- `users` - Custom user management
- `categories` - Product categories (5 categories will be auto-inserted)
- `products` - Product catalog
- `offers` - Offers/quotes
- `offer_items` - Individual items in offers

## Step 2: Seed the Database

After applying the migration, you need to populate the database with initial products.

### Option A: Using the Seed API Endpoint

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Open your browser and go to:
   ```
   http://localhost:3000/setup
   ```

3. Click the "Seed Database" button

### Option B: Using cURL

```bash
curl -X POST http://localhost:3000/api/seed
```

This will insert:
- 5 categories (if not already present)
- 24 products across all categories

## Step 3: Verify Setup

1. Check your Supabase dashboard
2. Navigate to the Table Editor
3. Verify that the following tables exist and have data:
   - `categories` (5 rows)
   - `products` (24 rows)
   - `offers` (empty initially)
   - `offer_items` (empty initially)
   - `users` (empty initially)

## Database Schema Overview

### Categories
- **chargers** (Įkrovimo stotelės) - Sort order: 1
- **inverters** (Inverteriai) - Sort order: 2
- **solar-panels** (Saulės moduliai) - Sort order: 3
- **mounting** (Montavimo sistema) - Sort order: 4
- **other** (Kita) - Sort order: 999

### Products (Sample)
- 4 charging stations (€749-€1,249)
- 4 inverters (€1,650-€2,450)
- 4 solar panels (€165-€185)
- 5 mounting systems & services (€850-€1,200)
- 7 accessories & services (€3.50-€450)

## Troubleshooting

### Migration Fails
- Check that your Supabase instance is running
- Verify database credentials in `.env.local`
- Make sure you have the `uuid-ossp` extension enabled

### Seed Fails
- Ensure the migration was applied successfully
- Check the API route logs for errors
- Verify network connectivity to Supabase

### Connection Issues
- Double-check `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- For API routes, check `SUPABASE_SERVICE_ROLE_KEY`

## Next Steps

After setup is complete, you can:
1. Create new offers at `/new-offer`
2. View all offers at `/`
3. Edit existing offers at `/offers/[id]`

All data will be persisted in your Supabase database.
