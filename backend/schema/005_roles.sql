-- ═══════════════════════════════════════════════════════════════════════════
--  005_roles.sql - grants for the read-only API roles
--
--  Why this file exists. Phase 0 of the backend migration stands PostgREST up
--  against this database. PostgREST does not connect as the role whose
--  privileges it uses: it logs in as one role and then SET ROLEs to another for
--  the duration of each request. That needs a PAIR of roles, not one.
--
--    langnav_read           NOLOGIN. Holds every SELECT grant. PostgREST's
--                           db-anon-role - what an unauthenticated request runs
--                           as.
--    langnav_authenticator  LOGIN NOINHERIT. Owns nothing and can read nothing
--                           on its own. Granted langnav_read purely so it can
--                           assume it.
--
--  NOINHERIT is the load-bearing word. Without it the authenticator would carry
--  langnav_read's privileges on every connection, and a leaked connection
--  string would be a standing SELECT on the whole schema. With it, the role has
--  no privilege at all until it explicitly assumes another one, which is the
--  only thing PostgREST ever asks it to do.
--
--  WHY THE ROLES ARE NOT CREATED HERE. Two reasons that happen to agree:
--
--    1. Privilege. The application role is NOSUPERUSER NOCREATEDB NOCREATEROLE
--       by deliberate design in scripts/bootstrap_database.py, so it CANNOT
--       execute CREATE ROLE. Verified against the server, not assumed:
--       "permission denied to create role". Granting it CREATEROLE to make this
--       file self-sufficient would dissolve a boundary that exists on purpose.
--
--    2. Lifetime. Roles are CLUSTER-level. They survive `--all`, and they
--       survive DROP DATABASE. Creating them belongs to the one-time bootstrap
--       precisely because it only has to happen once.
--
--  GRANTs on tables are database-scoped and have the opposite lifetime:
--  re-applying 001_schema.sql recreates every table, and every grant on the old
--  one goes with it. That is the whole reason this file exists rather than
--  being typed into psql once - run.py re-applies it on every load, so a
--  database and the repo cannot drift apart without someone noticing.
--
--  So: the bootstrap creates the roles, this file grants them what they read.
--  The split follows the privilege boundary exactly.
--
--  NO PASSWORD APPEARS IN THIS FILE, and none may ever be added. The
--  authenticator's password is set by the bootstrap script from backend/.env.
--  A test asserts the absence, because a credential committed to git is not
--  undone by deleting it later.
--
--  Apply after 001_schema.sql, and after 003_derive.sql so that anything those
--  files create is already present to be granted on.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;


-- ── Skip cleanly when there are no API roles ───────────────────────────────
-- run.py applies this file on EVERY load, including on an installation that
-- runs the ETL and has never wanted an API. Those databases have no
-- langnav_read, and a bare GRANT would abort their load with `role
-- "langnav_read" does not exist` - a hard failure in the data pipeline caused
-- entirely by an optional component being absent.
--
-- Skipping is not papering over the error. A grant to a role that does not
-- exist has no meaning to apply: if the role is absent there is no API, and
-- when the bootstrap creates it the next load grants everything here. The
-- NOTICE says so rather than passing in silence.
--
-- This costs the grants their plain-statement readability, since a conditional
-- one has to go through EXECUTE. Applying them unconditionally and letting
-- run.py decide was the alternative, and it was rejected: it splits one rule
-- across two files, and the SQL stops being runnable by hand.

DO $$
DECLARE
    fn record;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'langnav_read')
    OR NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'langnav_authenticator')
    THEN
        RAISE NOTICE
            'no API roles: skipping the API grants. This is normal on an '
            'installation without an API. To create the roles, run '
            'scripts/bootstrap_database.py --api-roles as a superuser.';
        RETURN;
    END IF;

    -- CONNECT, on the authenticator rather than on langnav_read, because the
    -- authenticator is the role that actually opens the socket; langnav_read is
    -- NOLOGIN and never connects to anything.
    --
    -- This is not the default. bootstrap_database.py issues REVOKE ALL ON
    -- DATABASE ... FROM PUBLIC when it creates the database, deliberately, so
    -- CONNECT has to be granted back by name. Without this line PostgREST does
    -- not fail on a query, it fails at startup with `permission denied for
    -- database`, which reads like a wrong password and is not one.
    EXECUTE 'GRANT CONNECT ON DATABASE ' || quote_ident(current_database())
            || ' TO langnav_authenticator';

    -- USAGE alone grants nothing readable; it only makes the schema's contents
    -- addressable. Without it every grant below is unreachable.
    EXECUTE 'GRANT USAGE ON SCHEMA public TO langnav_read';

    -- ALL TABLES covers the materialized view too. That is worth stating
    -- because the widely repeated version of this rule says it does not - that
    -- ALL TABLES expands over relkinds r, p, v and f only, leaving relkind m
    -- out. This file originally carried an extra
    -- `GRANT SELECT ON territory_stats` for exactly that reason.
    --
    -- Measured on PostgreSQL 18.4 rather than reasoned about: revoking SELECT
    -- on territory_stats and then issuing ONLY the statement below returns
    -- has_table_privilege = true. The separate grant was redundant, so it is
    -- gone. Do not re-add it without re-running that experiment - a redundant
    -- grant that claims to be load-bearing is worse than no grant at all.
    EXECUTE 'GRANT SELECT ON ALL TABLES IN SCHEMA public TO langnav_read';

    -- The grant above is a one-shot over what exists at this instant; it says
    -- nothing about a table created later. Default privileges cover that gap,
    -- so a table added to 001_schema.sql is readable without anyone
    -- remembering to come back here.
    --
    -- No FOR ROLE clause: it defaults to the role executing this file, which is
    -- the role that creates the tables. Naming the application role here would
    -- hardcode a value backend/.env lets an installer change.
    --
    -- Belt and braces rather than the primary mechanism: run.py re-applies this
    -- file on every load, so the explicit grant would catch up on the next run
    -- anyway. This closes the window in between.
    --
    -- Whether ON TABLES here also covers a FUTURE materialized view was not
    -- tested, unlike the claim above. It does not matter yet: the grant above
    -- is measured to cover the existing one, and any matview added later is
    -- picked up by the next load regardless.
    EXECUTE 'ALTER DEFAULT PRIVILEGES IN SCHEMA public '
            'GRANT SELECT ON TABLES TO langnav_read';

    -- Take EXECUTE away from the derive functions.
    --
    -- Postgres grants EXECUTE on every new function to PUBLIC by default, so
    -- these were callable by langnav_read without anything granting them.
    -- Measured, not assumed: SELECT rebuild_territory_ancestry() as
    -- langnav_read got past the privilege check and failed on the table write
    -- underneath. The data was never reachable, but the call ran.
    --
    -- That matters more under PostgREST than under psql, because PostgREST
    -- publishes every function the API role may execute as POST /rpc/<name>.
    -- Left alone, the whole derive chain becomes a set of public endpoints that
    -- take a write lock and then fail. Reads are the whole of Phase 0.
    --
    -- Owner is the filter, and it is exact: the 21 project functions belong to
    -- the role running this file, the 118 others in this schema belong to
    -- postgres and come from pg_trgm and btree_gin. Those must keep PUBLIC
    -- EXECUTE - the search endpoint's ilike goes through the trigram index.
    -- The filter is also a necessity rather than a nicety, since a non-owner
    -- cannot revoke on them anyway.
    FOR fn IN
        SELECT p.oid::regprocedure AS signature
          FROM pg_proc p
          JOIN pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'public'
           AND p.proowner = (SELECT oid FROM pg_roles WHERE rolname = current_user)
    LOOP
        EXECUTE 'REVOKE EXECUTE ON FUNCTION ' || fn.signature || ' FROM PUBLIC';
    END LOOP;
END
$$;


-- ── What is deliberately NOT granted ───────────────────────────────────────
-- No INSERT, UPDATE, DELETE or TRUNCATE, on anything. No USAGE on sequences,
-- so even a granted INSERT could not obtain an id. Writes are Phase 6 and need
-- a governance decision before they need a grant.
--
-- Note that two of those are absences rather than revocations: nothing here
-- grants them and PUBLIC never had them. Function EXECUTE is the opposite case
-- - PUBLIC holds it by default and it has to be taken away, which is why the
-- block above revokes rather than simply declining to grant.

COMMIT;
