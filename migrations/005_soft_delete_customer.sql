ALTER TABLE customer ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Replace the table-level UNIQUE on email with a partial unique index scoped to
-- active rows, so a soft-deleted customer frees up their email for re-use.
ALTER TABLE customer DROP CONSTRAINT IF EXISTS customer_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS customer_email_active_key
    ON customer (email) WHERE deleted_at IS NULL;
