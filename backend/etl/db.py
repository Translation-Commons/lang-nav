"""Postgres connection and bulk-load helpers.

Loading is done with COPY ... FROM STDIN rather than INSERT or an ORM. On this
shape of data COPY is roughly two orders of magnitude faster, because it sends
one stream per table instead of one statement per row and skips per-statement
parse and plan overhead. It is also the reason the ETL does not need an ORM at
all: the ORM would be bypassed for essentially every write.
"""

from __future__ import annotations

import contextlib
from pathlib import Path
from typing import Iterable, Iterator

import psycopg

from .config import DbConfig


@contextlib.contextmanager
def connect(cfg: DbConfig, autocommit: bool = False) -> Iterator[psycopg.Connection]:
    """Open a connection. Rolls back on any exception.

    RAISES statement_timeout FOR THE SESSION, which a managed host makes
    necessary. A local PostgreSQL defaults to 0, meaning no limit, so this
    changes nothing there. Supabase sets a 2 minute default on the database,
    and several derive steps are single statements that legitimately run longer
    than that - `rebuild_family_locales` for Glottolog builds 16,926 rows in
    one call. The first Supabase load died exactly there, with
    `canceling statement due to statement timeout`, after every COPY had
    already succeeded.

    Bounded rather than disabled. A runaway statement should eventually fail
    instead of holding locks indefinitely, and 30 minutes is far above the
    whole load's 243 seconds while still being a limit.

    This only sticks because the session pooler is used rather than the
    transaction pooler; a transaction-pooled connection would discard it.
    """
    conn = psycopg.connect(cfg.conninfo(), autocommit=autocommit)
    with conn.cursor() as cur:
        cur.execute(f"SET statement_timeout = '{cfg.statement_timeout}'")
    if not autocommit:
        conn.commit()
    try:
        yield conn
        if not autocommit:
            conn.commit()
    except Exception:
        if not autocommit:
            conn.rollback()
        raise
    finally:
        conn.close()


def run_sql_file(conn: psycopg.Connection, path: Path) -> None:
    """Execute a .sql file as a single script.

    The schema files manage their own BEGIN/COMMIT, so this is sent verbatim.
    psycopg surfaces the failing statement's position, which is what makes a
    first execution against a live server diagnosable.
    """
    sql = path.read_text(encoding="utf-8")
    with conn.cursor() as cur:
        cur.execute(sql)


def copy_rows(
    conn: psycopg.Connection,
    table: str,
    columns: Iterable[str],
    rows: Iterable[tuple],
) -> int:
    """Bulk load rows into a table. Returns the number of rows written."""
    cols = list(columns)
    if not cols:
        raise ValueError(f"{table}: no columns given")

    collist = ", ".join(f'"{c}"' for c in cols)
    written = 0
    with conn.cursor() as cur:
        with cur.copy(f'COPY "{table}" ({collist}) FROM STDIN') as copy:
            for row in rows:
                copy.write_row(row)
                written += 1
    return written


def not_null_columns(conn: psycopg.Connection) -> dict[str, set[str]]:
    """Columns that are NOT NULL and have no default, per table.

    Used for a pre-flight check before any COPY. Postgres reports one violation
    then aborts the transaction, so without this you learn about a single bad
    column per run. Checking up front surfaces every one of them at once.
    """
    rows = fetch_all(
        conn,
        """
        SELECT table_name, column_name
          FROM information_schema.columns
         WHERE table_schema = 'public'
           AND is_nullable = 'NO'
           AND column_default IS NULL
        """,
    )
    result: dict[str, set[str]] = {}
    for table, column in rows:
        result.setdefault(table, set()).add(column)
    return result


def scalar(conn: psycopg.Connection, sql: str, params: tuple = ()) -> object:
    with conn.cursor() as cur:
        cur.execute(sql, params)
        # fetchall() rather than fetchone(): on a zero-row result psycopg 3.2.3
        # raises InterfaceError from fetchone() instead of returning None.
        rows = cur.fetchall()
        return rows[0][0] if rows else None


def fetch_all(conn: psycopg.Connection, sql: str, params: tuple = ()) -> list[tuple]:
    with conn.cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchall()


def object_counts(conn: psycopg.Connection) -> dict[str, int]:
    """Count the schema objects, for the post-install verification step."""
    queries = {
        "tables": """
            SELECT count(*) FROM information_schema.tables
             WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        """,
        "enum_types": """
            SELECT count(*) FROM pg_type t
              JOIN pg_namespace n ON n.oid = t.typnamespace
             WHERE t.typtype = 'e' AND n.nspname = 'public'
        """,
        "indexes": """
            SELECT count(*) FROM pg_indexes WHERE schemaname = 'public'
        """,
        "functions": """
            SELECT count(*) FROM pg_proc p
              JOIN pg_namespace n ON n.oid = p.pronamespace
             WHERE n.nspname = 'public' AND p.prokind = 'f'
        """,
        "triggers": """
            SELECT count(*) FROM pg_trigger WHERE NOT tgisinternal
        """,
        "views": """
            SELECT count(*) FROM pg_views WHERE schemaname = 'public'
        """,
        "matviews": """
            SELECT count(*) FROM pg_matviews WHERE schemaname = 'public'
        """,
    }
    return {name: int(scalar(conn, sql)) for name, sql in queries.items()}
