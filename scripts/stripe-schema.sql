CREATE TABLE IF NOT EXISTS once_payment_orders (
 id uuid PRIMARY KEY, amount integer NOT NULL CHECK(amount BETWEEN 100 AND 500000),
 currency text NOT NULL DEFAULT 'gbp' CHECK(currency='gbp'), terms_version text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid')),
 intent_created_at bigint NOT NULL, session_id text UNIQUE, payment_intent_id text UNIQUE,
 refunded_amount integer NOT NULL DEFAULT 0 CHECK(refunded_amount>=0),
 created_at timestamptz NOT NULL DEFAULT now(), paid_at timestamptz
);
CREATE TABLE IF NOT EXISTS once_payment_events (id text PRIMARY KEY,type text NOT NULL,processed_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS once_payment_outbox (id text PRIMARY KEY,order_id uuid REFERENCES once_payment_orders(id),kind text NOT NULL,stripe_object_id text,created_at timestamptz NOT NULL DEFAULT now(),completed_at timestamptz);
CREATE TABLE IF NOT EXISTS once_payment_limits(key text PRIMARY KEY,minute timestamptz NOT NULL,count integer NOT NULL);

CREATE TABLE IF NOT EXISTS once_payment_refunds(payment_intent_id text PRIMARY KEY,amount integer NOT NULL CHECK(amount>=0));
