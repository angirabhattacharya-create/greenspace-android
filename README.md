# Paw & Petal — Customer App prototype

Two-category marketplace for plants and gardening, plus pets and animal care. Initial launch geography: Kolkata.

## Business decisions locked
- Brand: Paw & Petal.
- App structure: customer app plus a separate partner/admin app sharing one backend.
- AI Plant Doctor: excluded from product scope.
- Service fulfilment: hybrid in-house + independent gardeners.
- Job workflow: gardeners express interest/accept; admin confirms final assignment.
- Payment policy: online payment only. Do not offer cash-on-delivery or cash service settlement in the customer app.

## Stage 2 deliverables
- Supabase client configuration scaffold.
- PostgreSQL marketplace schema and initial RLS baseline.
- Customer, service, provider, booking, provider response, product, order, payment and review data model.
- Razorpay Edge Function outlines for secure server-side order creation and webhook reconciliation.
- Brand configuration and Android app identity.

## Important
The payment functions are intentionally incomplete and return HTTP 501. No real payment can be collected yet. Do not launch or accept money until Razorpay merchant onboarding, secure server-side order creation, webhook signature verification, idempotency, refund handling, reconciliation and end-to-end tests are complete.

The SQL is an initial architecture migration, not a security certification. Have a Supabase developer review and complete admin/catalogue policies, provider response RPC, audit logs, rate limits, privacy controls and data-retention rules before production. Do not expose service-role keys in the Android app.

## Setup
1. Create a Supabase project.
2. Copy `.env.example` to `.env` and fill the project URL and anon key.
3. Install dependencies with `npm install`.
4. Apply `supabase/migrations/0001_marketplace_core.sql` using Supabase CLI or SQL editor.
5. Start the Expo app using `npx expo start`.
6. Implement OTP auth, booking persistence, provider workflow and admin dashboard before field pilot.

## Job workflow
1. Customer submits booking request.
2. Eligible verified gardeners see the opportunity and submit an acceptance/interest response.
3. Admin reviews provider availability, skill, service area and customer schedule.
4. Admin confirms one provider and assigns the booking.
5. Customer receives confirmed provider details and pays online.
6. Provider completes the service; customer reviews.

Decide the exact payment timing (at booking request vs after admin confirms availability) before enabling live checkout. Recommended: collect payment only after admin confirms the provider and final quote; use a short payment expiry window.

## Payment rules
- All amounts are stored as integer paise.
- The server calculates the payable amount from trusted catalogue/booking records.
- Only verified Razorpay webhooks may mark a payment as paid.
- Client callbacks are not proof of payment.
- Failed or expired payment should not confirm the service.



## Current status
The customer prototype is being rebranded from UrbanGrow to Paw & Petal. AI Plant Doctor is not part of the product. Customer, partner and admin workflows, evidence capture, and production backend controls remain under development.
