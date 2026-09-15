-- ═══════════════════════════════════════════════════════════════════════════
--  006_rls.sql - row level security for the read-only API
--
--  Why this file exists. Supabase expects RLS on every table it exposes and
--  warns loudly when it is missing. More importantly, a hosted database is
--  reachable from the internet, and "the grants are correct" is a weaker
--  guarantee than "the grants are correct AND every table refuses by default".
--
--  RLS IS ENABLED LOCALLY TOO, DELIBERATELY. It would be easy to make this
--  Supabase-only, and that would mean the first time anyone exercised these
--  policies was in production. Test what you deploy.
--
--  ── The two facts that decide the shape of this file ──────────────────────
--
--  1. ENABLING RLS WITH NO POLICY DENIES EVERYTHING. There is no implicit
--     allow. So enablement and policy must land in the SAME transaction, or
--     there is a window where the API returns empty results rather than an
--     error - which is this project's worst failure shape.
--
--  2. THE TABLE OWNER BYPASSES RLS. The ETL connects as the owner, so the
--     loader is completely unaffected by anything here. Only the API role is
--     constrained. (This stops being true if anyone adds FORCE ROW LEVEL
--     SECURITY, which would break every load. Do not.)
--
--  ── What is NOT covered, and why ──────────────────────────────────────────
--
--  * Materialized views do not support RLS at all. `territory_stats` is
--    therefore protected by its GRANT alone, from 005_roles.sql.
--  * Ordinary views are not given policies either. A view executes with its
--    owner's rights, so it already bypasses the underlying tables' RLS.
--    `locale_population_anomaly` is readable because 005 grants SELECT on it.
--
--  The loop below is over ordinary tables only, and it is a LOOP rather than
--  36 hand-written pairs so that a table added to 001_schema.sql is covered on
--  the next load without anyone remembering this file exists.
--
--  Apply after 005_roles.sql.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

DO $$
DECLARE
    t record;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'langnav_read') THEN
        RAISE NOTICE
            'no langnav_read role: skipping RLS. Enabling it without a policy '
            'would deny every read, so this file does nothing until the API '
            'roles exist. Run scripts/bootstrap_database.py --api-roles.';
        RETURN;
    END IF;

    FOR t IN
        SELECT c.relname
          FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = 'public'
           AND c.relkind = 'r'
         ORDER BY c.relname
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t.relname);

        -- Idempotent: the policy is dropped and recreated rather than guarded
        -- with IF NOT EXISTS, which CREATE POLICY does not support. Both
        -- statements are inside this transaction, so no request can arrive
        -- between them and find the table enabled but unpoliced.
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I',
                       'langnav_read_' || t.relname, t.relname);

        -- SELECT only, unconditionally true. This is a public read-only
        -- reference catalogue: there are no rows one caller may see and
        -- another may not. RLS here is a floor, not a filter.
        --
        -- TO langnav_read also covers any role that is a MEMBER of it, which
        -- is how this works on Supabase: `GRANT langnav_read TO anon` makes
        -- anon inherit the policy without it being named here.
        EXECUTE format(
            'CREATE POLICY %I ON %I FOR SELECT TO langnav_read USING (true)',
            'langnav_read_' || t.relname, t.relname);
    END LOOP;
END
$$;

COMMIT;
