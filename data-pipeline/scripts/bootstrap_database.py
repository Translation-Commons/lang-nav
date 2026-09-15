"""Create the lang-nav database and its application role. Run once.

    python scripts/bootstrap_database.py              show what it would do
    python scripts/bootstrap_database.py --apply      actually create them

    python scripts/bootstrap_database.py --api-roles          dry run
    python scripts/bootstrap_database.py --api-roles --apply  create them

ISOLATION GUARANTEES. This script is deliberately narrow, because it runs with
superuser credentials on a server that hosts other databases:

  1. It only ever CREATEs. There is no DROP, no TRUNCATE and no --force path.
  2. It refuses to touch any database other than LANGNAV_DB from .env, and
     refuses outright if that name is a system database.
  3. If the target database already exists it reports and stops, rather than
     modifying it.
  4. The role it creates is NOSUPERUSER NOCREATEDB NOCREATEROLE, so the ETL
     credentials cannot reach any other database on the server.
  5. It prints the list of existing databases before and after, so the
     no-collateral-damage claim is verifiable rather than asserted.

WHY --api-roles LIVES HERE. It creates the two roles PostgREST needs. Roles are
cluster-level objects and CREATE ROLE needs the CREATEROLE attribute, which
guarantee 4 deliberately denies the application role - so this work cannot live
in schema/005_roles.sql with the grants, and it is superuser work by nature.

It is a SEPARATE MODE, not a step in the flow above, because it has to run
against a database that already exists. Guarantee 3 makes the main path stop on
exactly that condition, and the API roles are usually wanted long after the
database was created. The two modes share nothing but the connection.
"""

from __future__ import annotations

import argparse
import dataclasses
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import psycopg
from psycopg import sql

from etl.config import (
    API_ANON_ROLE,
    ConfigError,
    api_authenticator_db,
    bootstrap_db,
    langnav_db,
    target_db_name,
)


def list_databases(conn: psycopg.Connection) -> list[str]:
    with conn.cursor() as cur:
        cur.execute("SELECT datname FROM pg_database ORDER BY datname")
        return [r[0] for r in cur.fetchall()]


def role_exists(conn: psycopg.Connection, role: str) -> bool:
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM pg_roles WHERE rolname = %s", (role,))
        # fetchall() rather than fetchone(): on a zero-row result psycopg 3.2.3
        # raises InterfaceError from fetchone() instead of returning None.
        return len(cur.fetchall()) > 0


def create_api_roles(argv_apply: bool, grant_to: str | None = None) -> int:
    """Create the two roles PostgREST needs. Idempotent, and creates nothing else.

    langnav_read is NOLOGIN and holds the SELECT grants that
    schema/005_roles.sql applies. langnav_authenticator is what PostgREST puts
    in its connection string; it owns nothing and is NOINHERIT, so it carries no
    privilege at all until it explicitly SET ROLEs to langnav_read. That is what
    keeps a leaked connection string from being a standing read on the schema.

    `grant_to` is for managed hosts that bring their own anonymous role. On
    Supabase the API runs as `anon`, so `--grant-to anon` makes anon a MEMBER of
    langnav_read rather than duplicating the grants onto it. That keeps one
    place deciding what is readable, and the RLS policies in 006_rls.sql apply
    to anon automatically, because a policy naming a role also covers its
    members.
    """
    try:
        boot = bootstrap_db()
        api = api_authenticator_db()
    except ConfigError as exc:
        print(f"configuration error: {exc}", file=sys.stderr)
        return 2

    print(f"bootstrap connection : {boot.redacted()}")
    print(f"anonymous role       : {API_ANON_ROLE}")
    print(f"authenticator role   : {api.user}")
    print()

    with psycopg.connect(boot.conninfo(), autocommit=True) as conn:
        has_anon = role_exists(conn, API_ANON_ROLE)
        has_auth = role_exists(conn, api.user)
        print(f"role {API_ANON_ROLE!r} exists: {has_anon}")
        print(f"role {api.user!r} exists: {has_auth}")

        if not argv_apply:
            print("\nDRY RUN. Would execute:")
            print(f"  CREATE ROLE {API_ANON_ROLE} NOLOGIN;"
                  if not has_anon else
                  f"  ALTER ROLE {API_ANON_ROLE} NOLOGIN;")
            print(f"  CREATE ROLE {api.user} LOGIN NOINHERIT PASSWORD '***';"
                  if not has_auth else
                  f"  ALTER ROLE {api.user} LOGIN NOINHERIT PASSWORD '***';")
            print(f"  GRANT {API_ANON_ROLE} TO {api.user};")
            if grant_to:
                print(f"  GRANT {API_ANON_ROLE} TO {grant_to};")
            print("\nRe-run with --apply to execute.")
            print("Then: python -m etl.run --roles, to apply the grants "
                  "in schema/005_roles.sql.")
            return 0

        with conn.cursor() as cur:
            # Create and configure are separate statements throughout: a role
            # left over from an earlier run must still end up with the right
            # attributes, or a database that predates a change here keeps the
            # old behaviour with nothing to show for it.
            if not has_anon:
                cur.execute(sql.SQL("CREATE ROLE {}").format(
                    sql.Identifier(API_ANON_ROLE)))
                print(f"created role {API_ANON_ROLE}")
            cur.execute(sql.SQL("ALTER ROLE {} NOLOGIN").format(
                sql.Identifier(API_ANON_ROLE)))

            if not has_auth:
                cur.execute(sql.SQL("CREATE ROLE {}").format(
                    sql.Identifier(api.user)))
                print(f"created role {api.user}")
            cur.execute(
                sql.SQL("ALTER ROLE {} LOGIN NOINHERIT PASSWORD {}").format(
                    sql.Identifier(api.user), sql.Literal(api.password)
                )
            )

            cur.execute(sql.SQL("GRANT {} TO {}").format(
                sql.Identifier(API_ANON_ROLE), sql.Identifier(api.user)))

            if grant_to:
                if not role_exists(conn, grant_to):
                    print(f"role {grant_to!r} does not exist on this server. "
                          f"On Supabase 'anon' is created with the project; "
                          f"check the name before re-running.", file=sys.stderr)
                    return 1
                cur.execute(sql.SQL("GRANT {} TO {}").format(
                    sql.Identifier(API_ANON_ROLE), sql.Identifier(grant_to)))
                print(f"granted {API_ANON_ROLE} to {grant_to}")

        # Report the end state from the catalog rather than from what was just
        # executed, so the claim is measured and not merely asserted.
        with conn.cursor() as cur:
            cur.execute(
                "SELECT rolname, rolcanlogin, rolinherit, rolsuper, "
                "       rolcreaterole, rolcreatedb "
                "  FROM pg_roles WHERE rolname = ANY(%s) ORDER BY rolname",
                ([API_ANON_ROLE, api.user],),
            )
            print("\nrole            login inherit super createrole createdb")
            for name, login, inherit, sup, crole, cdb in cur.fetchall():
                print(f"  {name:<22} {login!s:<5} {inherit!s:<7} {sup!s:<5} "
                      f"{crole!s:<10} {cdb!s}")

    print(f"\ndone. Next: python -m etl.run --roles, which applies "
          f"schema/005_roles.sql and grants {API_ANON_ROLE} its reads.")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="bootstrap_database")
    parser.add_argument(
        "--apply", action="store_true",
        help="actually create the database and role (default is a dry run)",
    )
    parser.add_argument(
        "--api-roles", action="store_true",
        help="create the PostgREST read-only roles instead, against an "
             "existing database",
    )
    parser.add_argument(
        "--grant-to", metavar="ROLE",
        help="also make ROLE a member of langnav_read. For a managed host that "
             "brings its own anonymous role, eg. --grant-to anon on Supabase",
    )
    args = parser.parse_args(argv)

    if args.api_roles:
        return create_api_roles(args.apply, args.grant_to)
    if args.grant_to:
        print("--grant-to only applies with --api-roles", file=sys.stderr)
        return 2

    try:
        boot = bootstrap_db()
        app = langnav_db()
        target = target_db_name()
    except ConfigError as exc:
        print(f"configuration error: {exc}", file=sys.stderr)
        return 2

    print(f"bootstrap connection : {boot.redacted()}")
    print(f"target database      : {target}")
    print(f"application role     : {app.user}")
    print()

    # autocommit because CREATE DATABASE cannot run inside a transaction block.
    with psycopg.connect(boot.conninfo(), autocommit=True) as conn:
        before = list_databases(conn)
        print(f"databases before ({len(before)}): {', '.join(before)}")

        if target in before:
            print(
                f"\ndatabase {target!r} already exists. This script will not "
                f"modify an existing database. Nothing done.",
                file=sys.stderr,
            )
            return 1

        has_role = role_exists(conn, app.user)
        print(f"role {app.user!r} exists: {has_role}")

        if not args.apply:
            print("\nDRY RUN. Would execute:")
            if not has_role:
                print(f"  CREATE ROLE {app.user} LOGIN PASSWORD '***' "
                      f"NOSUPERUSER NOCREATEDB NOCREATEROLE;")
            print(f"  CREATE DATABASE {target} OWNER {app.user} ENCODING 'UTF8';")
            print(f"  REVOKE ALL ON DATABASE {target} FROM PUBLIC;")
            print("\nRe-run with --apply to execute.")
            return 0

        with conn.cursor() as cur:
            if not has_role:
                cur.execute(
                    sql.SQL(
                        "CREATE ROLE {} LOGIN PASSWORD {} "
                        "NOSUPERUSER NOCREATEDB NOCREATEROLE"
                    ).format(sql.Identifier(app.user), sql.Literal(app.password))
                )
                print(f"created role {app.user}")
            else:
                # The role may pre-date this script; make sure the password in
                # .env is the one that actually works.
                cur.execute(
                    sql.SQL("ALTER ROLE {} WITH LOGIN PASSWORD {}").format(
                        sql.Identifier(app.user), sql.Literal(app.password)
                    )
                )
                print(f"role {app.user} already existed; password synchronised")

            cur.execute(
                sql.SQL("CREATE DATABASE {} OWNER {} ENCODING 'UTF8'").format(
                    sql.Identifier(target), sql.Identifier(app.user)
                )
            )
            print(f"created database {target}")

            # Keep the new database off-limits to every other role by default.
            cur.execute(
                sql.SQL("REVOKE ALL ON DATABASE {} FROM PUBLIC").format(
                    sql.Identifier(target)
                )
            )

        after = list_databases(conn)
        print(f"\ndatabases after ({len(after)}): {', '.join(after)}")
        added = sorted(set(after) - set(before))
        removed = sorted(set(before) - set(after))
        print(f"added: {added}")
        print(f"removed: {removed}  <- must be empty")
        if removed:
            print("UNEXPECTED: a database disappeared.", file=sys.stderr)
            return 1

    # The extensions in 001_schema.sql (btree_gin, pg_trgm) need superuser on a
    # default install, so they are created here rather than failing mid-schema.
    boot_in_target = dataclasses.replace(boot, dbname=target)
    with psycopg.connect(boot_in_target.conninfo(), autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute("CREATE EXTENSION IF NOT EXISTS btree_gin")
            cur.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
            cur.execute(
                sql.SQL("GRANT ALL ON SCHEMA public TO {}").format(
                    sql.Identifier(app.user)
                )
            )
        print(f"extensions btree_gin and pg_trgm installed in {target}")

    print("\ndone. Next: python -m etl.run --all")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
