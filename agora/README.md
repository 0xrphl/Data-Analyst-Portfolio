# 3D Agora Lab — Store Infrastructure

## Directory Structure
```
agora/
├── schema/           SQL migrations (run in Supabase SQL Editor)
│   ├── 001_initial.sql       profiles, categories, products
│   └── 002_orders_cart.sql   cart, orders, manufacturing costs
├── scripts/          Seed data
│   ├── seed_products.sql         Hogar + Belleza products
│   ├── seed_accesorios.sql       Accesorios products
│   └── seed_extras.sql           Extra products + manufacturing costs
├── edge-functions/   Supabase Edge Functions (payment backend)
│   ├── create-mp-preference/     Creates Mercado Pago checkout
│   └── mp-webhook/               Handles payment confirmations
└── README.md
```

## Setup Steps

### 1. Supabase DB (agora_db)
Run in SQL Editor in order:
1. `schema/001_initial.sql`
2. `schema/002_orders_cart.sql`
3. `scripts/seed_products.sql`
4. `scripts/seed_accesorios.sql`
5. `scripts/seed_extras.sql`

### 2. Supabase Auth
- Enable Google OAuth in Authentication → Providers → Google
- Enable Email/Password in Authentication → Providers → Email

### 3. Edge Functions (Mercado Pago)
```bash
supabase secrets set MP_ACCESS_TOKEN=APP_USR-xxx --project-ref ohidinrnomoyvzpighos
supabase secrets set MP_CLIENT_SECRET=xxx --project-ref ohidinrnomoyvzpighos
supabase functions deploy create-mp-preference --project-ref ohidinrnomoyvzpighos
supabase functions deploy mp-webhook --project-ref ohidinrnomoyvzpighos
```

### 4. Product Assets
Upload compressed images/videos to `public/store/assets/products/` and `public/store/assets/videos/`.

### 5. Domain
Point `3dagoralab.com` DNS to Hostinger. Add as addon domain.

## Supabase Project
- URL: `https://ohidinrnomoyvzpighos.supabase.co`
- Anon key: `sb_publishable_jhCUR3cb7V9cBK3y3fYrng_zUPdGUsd`
