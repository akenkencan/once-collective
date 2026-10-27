# ONCE direct support: website integration

26 October 2026. Recipient confirmed by Alex: no incorporated company and no VAT registration. The launch recipient is Alex Kennedy trading as ONCE Collective. This is an individual creative practice; no charity or Gift Aid claims are made. No VAT is added. Business-income records and Self Assessment obligations remain separate from VAT.

## Implemented

- `/connected#support`: GBP amount selection and custom amount, £1–£5,000, clear voluntary-support terms, explicit confirmation and secure hosted checkout.
- `/support-terms`: individual recipient, purpose, rights, payment/privacy information and query route.
- `/support-received`: token-authorised status lookup, pending/verified/refund states. The redirect never proves payment.
- `/api/stripe/checkout`: readiness check, signed one-hour intent, strict origins, bounded JSON, durable rate limit, immutable order, Stripe idempotency and safe hosted redirect.
- `/api/stripe/webhook`: exact raw body, official SDK asynchronous signature verification, mode checks and atomic paid-order/event/outbox writes. Both immediate and delayed paid events are handled.
- `/api/stripe/status`: signed receipt capability, no identity or payment details disclosed.
- PostgreSQL: durable orders, events, personal-acknowledgment tasks, review tasks and cumulative refunds. Refunds received before the paid event are retained and applied when settlement is recorded. A PostgreSQL advisory lock serialises these updates by payment intent.

The initial release accepts unconditional support only. It does not sell cards, access, memberships, future equity or returns. Personal acknowledgments are tasks for Alex, not automatic card entitlements. The former Open Collective tier iframe is replaced with direct support; a clear Open Collective link remains available while direct support is unconfigured.

## Environment and storage

Use `.env.example` for variable names. Configure actual credentials in Vercel's environment settings, never in a public JS file. `STRIPE_SECRET_KEY` accepts a restricted `rk_test_` key; use least privileges sufficient for Checkout Sessions and relevant reads. Configure a separate dedicated sandbox and a dedicated managed PostgreSQL database with verified TLS (for example, a URL with sslmode=verify-full). Do not use serverless local files or SQLite as production storage. No existing secret files were opened by this task.

The site now uses Vercel's `bunVersion: 1.x` runtime. Functions remain CommonJS in the existing `/api` structure. Bun.SQL provides connection pooling and parameterised transactions. The official Stripe SDK is pinned in the root package/lockfile. Run `bun install --frozen-lockfile` at build time. Existing API routes still resolve normally.

1. Configure ONCE_PAYMENTS_DATABASE_URL privately and run `bun run payments:migrate` against that dedicated database. The migration is an explicit operator action; functions do not create tables.
2. Generate ONCE_PAYMENTS_TOKEN_SECRET using a secure random generator, at least 32 characters. Generate and keep a stable ONCE_STRIPE_INTEGRATION_IDENTIFIER with the form `once_support_` followed by eight random lowercase letters. Do not rotate these during an active checkout session.
3. Configure ONCE_PAYMENTS_ORIGIN to the exact public HTTPS origin (or an explicitly configured Vercel preview origin). Success and cancel URLs come from this configuration, never request headers.
4. In the sandbox create a webhook destination for `/api/stripe/webhook`, with checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, charge.refunded, charge.dispute.created and charge.dispute.closed. Store its signing secret privately. Use a preview deployment for this work until live activation is approved.
5. Configure eligible payment methods in Stripe Dashboard (optionally pass a payment-method configuration ID). Dynamic payment methods are used. Adaptive Pricing is off because this ledger reconciles GBP exactly.
6. Set ONCE_STRIPE_ENABLED=true only when these sandbox settings exist. Keep ONCE_STRIPE_MODE=sandbox and live approval false. The website visibly labels sandbox checkout. Never use real card details in sandbox.

No tax registration should be created merely to make the Tax feature return a nonzero amount. The inspected sandbox has active Tax settings but no active registrations. Automatic tax is intentionally false for this nonregistered individual support route. Future VAT registration or a goods/services offer requires a separate review, product classification and implementation change.

## Invoicing

For an agreed commission or sponsorship, create a draft invoice in Stripe Dashboard. The supplier is Alex Kennedy trading as ONCE Collective, with the actual seller address/contact details. Add an accurate description, GBP amount, payment terms and customer details. Do not add VAT or a VAT number while unregistered. Check the draft, then finalise/send through Dashboard when the customer and terms are confirmed. Do not invoice an unconditional contribution as a purchase of cards or company equity. The current website does not expose a public invoice-creation API.

Enable Stripe's successful-payment/refund receipt emails in Dashboard. Receipts and the website's confirmation serve different purposes. Keep personal acknowledgment separate and do not assume a queued task has been delivered.

## Operations

Review pending `once_payment_outbox` tasks privately. A task's order gives its Stripe session/payment reference; use Dashboard to contact the supporter if appropriate. Mark completed_at only after handling it. Disputes and asynchronous failures create review tasks. Automated messages and shipping are not implemented.

Reconcile payments, fees, refunds, disputes and payouts daily during the pilot. Log only event IDs/types and coarse failure codes; never raw bodies, contact data, keys or receipt tokens. Vercel access logs may contain status-query capability tokens; restrict log access and retention. Clean old pending orders, expired one-hour rate-limit keys and completed tasks under a written retention policy. Accounting records require their own retention schedule.

The acknowledgment workload is deliberately manual for a small first cohort. The stored acknowledgment record is an operational queue, not evidence that a personal message was sent. Failed webhook processing returns a retriable error rather than silently acknowledging loss. Stripe retries are not an unlimited recovery policy: monitor destination failures and reconcile missed payments in Dashboard.

## Live activation and remaining checks

- Confirm the Stripe live account is configured for the individual/sole trader recipient and payouts are verified. Sandbox setup does not verify live eligibility.
- Add the actual seller email and correspondence address to Stripe and secure environment settings. Make them visible in the site's support terms before live activation. The runtime requires seller details and explicit ONCE_STRIPE_LIVE_APPROVED=true for live checkout.
- Test the migration and concurrent/duplicate events against an isolated PostgreSQL database, plus successful checkout/3DS/decline/cancel/expired intent, webhook outage/replay, refunds before/after settlement, partial refund and dispute review.
- Check mobile layout, keyboard access and readiness/unavailable states in the actual deployed preview. Check return URLs and receipt emails, including no marketing opt-in by payment.
- Review final support terms and surrounding pages for conflicting promises. A consistent promise of cards/access can change the payment classification even where this form says support.
- Use separate live credentials/storage/signing secret, set mode=live and activate only after the checks. Do not repoint the sandbox database to live or reuse sandbox orders.

Useful sources: [Stripe without a separate company](https://support.stripe.com/questions/selling-on-stripe-without-a-separate-business-entity), [HMRC sole-trader registration](https://www.gov.uk/become-sole-trader/register-sole-trader), [HMRC voluntary business receipts](https://www.gov.uk/hmrc-internal-manuals/business-income-manual/bim41810), [Vercel Bun runtime](https://vercel.com/docs/functions/runtimes/bun).

## Validation completed in this change

The full website suite passes: 47 tests, covering the new payment logic and embedded PostgreSQL ledger plus existing gallery, media and API security cases. Desktop and 390-pixel mobile browser checks passed after correcting inherited form styles. No browser console errors were reported on the support page. The database tests execute the production SQL and verify duplicate paid events, mismatch rollback, refunds before settlement, monotonic partial refunds, durable rate limits and rollback when acknowledgment queuing fails. They do not verify a hosted database connection, network concurrency under Bun.SQL or a deployed Vercel webhook destination. The official Stripe SDK verifies a generated signature and rejects an altered payload using the same asynchronous signature API as production.

## Contribution comparison toggle —27 October2026

Open Collective remains the default on every page load with its original four options and checkout. The unlabelled iridescent switch has the accessible name “Use direct Stripe contributions”. Switching reveals the existing GBP one-time support form with three amount suggestions and a custom amount. No subscription offer is added. The selection is deliberately not persisted, and does not change currencies or amounts in an existing payment. Stripe readiness is requested only on the first switch to Stripe. Missing configuration keeps its checkout disabled and directs visitors back to Open Collective.

The UI toggle does not enable live payments, alter Stripe settings, migrate Open Collective supporters or run the database migration. Private environment configuration and deployed sandbox acceptance remain required before the direct route can take payments. The authored heading remains “contribute for compounding legacy”.
