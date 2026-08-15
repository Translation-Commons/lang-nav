"""Tests for the read-only API roles, Phase 0 of the backend migration.

These run without a database, so what they can check is the shape of the files,
not the privileges themselves. Verifying the privileges means running the
statements against a live server and reading pg_roles and has_table_privilege
back, which is out of scope for a suite that must run without one.

What is pinned here is the part a future edit could break silently:

  * 005_roles.sql never carrying a password literal, which git would keep
    forever;
  * run.py continuing to apply it, and applying it AFTER the files whose objects
    it grants on;
  * the role names in config.py agreeing with the ones the SQL grants to. The
    SQL cannot read .env, so a rename on one side alone would grant reads to a
    role nobody connects as - and no error would say so.
"""

import re

from etl.config import (
    API_ANON_ROLE,
    API_AUTHENTICATOR_ROLE,
    SCHEMA_DIR,
    postgrest_settings,
)

ROLES_SQL = (SCHEMA_DIR / "005_roles.sql").read_text(encoding="utf-8")
RUN_PY = (SCHEMA_DIR.parent / "etl" / "run.py").read_text(encoding="utf-8")


def code_only(sql: str) -> str:
    """Strip `--` comments, so absence assertions run against executable SQL
    rather than tripping over a comment that discusses the thing."""
    return "\n".join(
        line for line in sql.splitlines() if not line.lstrip().startswith("--")
    )


# ── The credential rule ────────────────────────────────────────────────────

def test_no_password_literal():
    """The one regression that cannot be undone by a later commit. The roles are
    created without a password by bootstrap_database.py, which reads .env; this
    file only ever grants."""
    code = code_only(ROLES_SQL).upper()
    assert "PASSWORD" not in code
    assert "CREATE ROLE" not in code, (
        "roles are cluster-level and need CREATEROLE, which the application "
        "role deliberately does not have - creation belongs to "
        "scripts/bootstrap_database.py --api-roles"
    )


def test_no_local_paths_or_private_references():
    """Project hard rule 8."""
    assert ".private" not in ROLES_SQL
    assert not re.search(r"\b[A-Za-z]:[\\/]", ROLES_SQL)


def test_no_em_dashes():
    """Project hard rule 4. chr(8212) rather than the literal character, since
    writing it here would itself break the rule."""
    assert ROLES_SQL.count(chr(8212)) == 0


# ── The role names, kept in step with config.py ────────────────────────────

def test_the_sql_grants_to_the_roles_config_names():
    """A .sql file cannot read .env, so these names are constants on the Python
    side and literals on the SQL side. If the two drift, the grants land on a
    role nobody connects as and every request 401s with nothing to explain it."""
    assert API_ANON_ROLE in ROLES_SQL
    assert API_AUTHENTICATOR_ROLE in ROLES_SQL


def test_the_anon_role_is_the_one_that_receives_the_reads():
    code = code_only(ROLES_SQL)
    assert f"GRANT SELECT ON ALL TABLES IN SCHEMA public TO {API_ANON_ROLE}" in code
    assert f"GRANT USAGE ON SCHEMA public TO {API_ANON_ROLE}" in code


def test_connect_is_granted_to_the_authenticator_not_the_anon_role():
    """CONNECT belongs to the role that opens the socket. langnav_read is
    NOLOGIN and never connects to anything.

    This is not a default: bootstrap_database.py revokes ALL on the database
    from PUBLIC when it creates it, so CONNECT has to be granted back by name.
    Without it PostgREST fails at STARTUP with `permission denied for database`,
    which reads like a wrong password and is not one."""
    code = code_only(ROLES_SQL)
    assert "GRANT CONNECT ON DATABASE" in code
    assert f"TO {API_AUTHENTICATOR_ROLE}" in code


# ── What must never be granted ─────────────────────────────────────────────

def test_no_write_privilege_is_granted():
    """Phase 0 is reads. Writes are Phase 6 and need a governance decision
    first."""
    code = code_only(ROLES_SQL).upper()
    for privilege in ("INSERT", "UPDATE", "DELETE", "TRUNCATE", "ALL PRIVILEGES"):
        assert f"GRANT {privilege}" not in code, privilege


def test_function_execute_is_revoked_from_public():
    """Postgres grants EXECUTE on every new function to PUBLIC by default, so
    the derive chain was callable by the anonymous role without anything
    granting it. PostgREST publishes every executable function as
    POST /rpc/<name>, which would put the whole derive chain on the public
    internet as endpoints that take a write lock and then fail.

    The owner filter is what keeps this off the pg_trgm and btree_gin functions,
    which must keep PUBLIC EXECUTE - the search endpoint's ilike goes through
    the trigram index."""
    code = code_only(ROLES_SQL)
    assert "REVOKE EXECUTE ON FUNCTION" in code
    assert "FROM PUBLIC" in code
    assert "p.proowner" in code, (
        "the revoke must be filtered by owner, or it would try to take EXECUTE "
        "away from the extension functions too"
    )


# ── run.py has to actually apply it ────────────────────────────────────────

def test_run_py_applies_the_roles_file():
    assert '"005_roles.sql"' in RUN_PY


def test_roles_are_applied_after_the_files_they_grant_on():
    """005 grants on whatever 001, 003 and 004 have created. Applying it first
    would grant on a subset and silently miss anything newer."""
    for section in (RUN_PY.split("def _do_load(", 1)[1],
                    RUN_PY.split("if args.schema:", 1)[1].split("if args.load", 1)[0]):
        derive_at = section.index('"003_derive.sql"')
        roles_at = section.index('"005_roles.sql"')
        assert derive_at < roles_at, (
            "005_roles.sql must be applied after 003_derive.sql"
        )


def test_roles_can_be_applied_without_a_reload():
    """Table grants die with the tables when 001_schema.sql is re-applied, while
    the roles themselves survive - they are cluster-level. Re-granting therefore
    has to be possible on its own, or the only route back would be --schema or
    --load --fresh, both of which destroy data to apply a SELECT grant."""
    assert '"--roles"' in RUN_PY
    assert "args.roles" in RUN_PY


def test_every_schema_file_is_applied_by_run_py():
    """A guard rather than a test of today's behaviour: adding 006_*.sql without
    wiring it in would leave a file in the repo that never reaches a database,
    and nothing else would notice."""
    for path in sorted(SCHEMA_DIR.glob("*.sql")):
        assert f'"{path.name}"' in RUN_PY, f"{path.name} is never applied by run.py"


# ── The file's own shape ───────────────────────────────────────────────────

def test_the_file_is_transactional():
    """A half-applied grant file leaves the API able to read some tables and not
    others, which presents as a bug in whatever queried the missing one."""
    statements = [
        line for line in ROLES_SQL.splitlines()
        if line.strip() and not line.lstrip().startswith("--")
    ]
    assert statements[0].strip() == "BEGIN;"
    assert statements[-1].strip() == "COMMIT;"


def test_it_skips_rather_than_fails_when_the_roles_are_absent():
    """run.py applies this on EVERY load, including on an installation that runs
    the ETL and has never wanted an API. A bare GRANT would abort their load
    with `role does not exist` - a hard failure in the data pipeline caused
    entirely by an optional component being absent."""
    code = code_only(ROLES_SQL)
    assert "RAISE NOTICE" in code
    assert "RAISE EXCEPTION" not in code
    assert "RETURN;" in code


# ── The generated PostgREST config ─────────────────────────────────────────

# The config is generated because it embeds a password and therefore cannot be
# committed. The generator can, so it is what gets tested. These pin the two
# settings that are safety-relevant rather than cosmetic.

GENERATOR = (SCHEMA_DIR.parent / "scripts" / "write_postgrest_config.py").read_text(
    encoding="utf-8"
)


def test_the_generator_interpolates_the_password_rather_than_embedding_one():
    """Same rule as 005_roles.sql, stated as the property that actually matters.

    The word "password" appears throughout this file legitimately - in comments,
    in `{password}`, in `api.password` - so its presence proves nothing. What
    must hold is that the value arrives at run time from .env and that the
    template carries only a placeholder."""
    assert "{password}" in GENERATOR
    assert "api_authenticator_db()" in GENERATOR, "the value comes from .env"
    # No literal assignment of a password value anywhere in the file.
    assert not re.search(r"password\s*=\s*['\"][^'\"{}]+['\"]", GENERATOR)


def test_the_password_is_percent_encoded_into_the_uri():
    """db-uri is a URI. A password containing @ / : or # would otherwise split
    it at the wrong place, and the failure would look like a wrong credential."""
    assert "quote(api.password" in GENERATOR


def test_cors_is_not_left_open_by_default():
    """PostgREST treats an empty server-cors-allowed-origins as "any origin".
    The default must therefore be a real list, not an empty string."""
    settings = postgrest_settings()
    assert settings.cors_origins != ""
    assert "localhost:5173" in settings.cors_origins, "npm run dev"
    assert "localhost:4173" in settings.cors_origins, "npm run preview"


def test_max_rows_cannot_silently_truncate_the_largest_table():
    """db-max-rows is a backstop, not a page size.

    A capped response is INDISTINGUISHABLE from a complete one: Content-Range
    reports `0-99999/*`, with a literal asterisk for the total, and no loader
    asks for a count today. So the cap must stay above every table or it would
    truncate the data with nothing to say it had.

    `locale` is the largest at 54,731 rows. The margin is deliberate: this fails
    if someone tunes the cap down to a comfortable-looking page size."""
    largest_table_rows = 54_731
    assert int(postgrest_settings().max_rows) > largest_table_rows


def test_the_generator_writes_into_the_gitignored_tools_directory():
    """postgrest.conf holds a credential. It must not land anywhere tracked."""
    assert 'out_dir = BACKEND_DIR / "tools"' in GENERATOR
    gitignore = (SCHEMA_DIR.parent.parent / ".gitignore").read_text(encoding="utf-8")
    assert "backend/tools/" in gitignore


# ── 006_rls.sql ────────────────────────────────────────────────────────────

RLS_SQL = (SCHEMA_DIR / "006_rls.sql").read_text(encoding="utf-8")


def test_rls_never_forces_row_level_security():
    """FORCE ROW LEVEL SECURITY would apply the policies to the TABLE OWNER too.

    The ETL connects as the owner and relies on bypassing RLS. Adding FORCE
    would break every load, and the symptom would be a load that writes nothing
    rather than one that errors."""
    assert "FORCE ROW LEVEL SECURITY" not in code_only(RLS_SQL).upper()


def test_rls_enables_and_polices_in_the_same_file():
    """Enabling RLS with no policy denies EVERY read - there is no implicit
    allow. The two must land together, or there is a window where the API
    returns empty results rather than an error, which is this project's worst
    failure shape."""
    code = code_only(RLS_SQL)
    assert "ENABLE ROW LEVEL SECURITY" in code
    assert "CREATE POLICY" in code
    enable_at = code.index("ENABLE ROW LEVEL SECURITY")
    policy_at = code.index("CREATE POLICY")
    assert enable_at < policy_at, "enable then police, inside one loop iteration"


def test_rls_policies_are_select_only():
    """Phase 0 is reads. A policy for any other command would grant a write path
    that the grants in 005 deliberately withhold."""
    code = code_only(RLS_SQL).upper()
    assert "FOR SELECT" in code
    for command in ("FOR INSERT", "FOR UPDATE", "FOR DELETE", "FOR ALL"):
        assert command not in code, command


def test_rls_targets_the_anon_role_so_members_inherit_it():
    """A policy naming a role also covers roles that are MEMBERS of it. That is
    how this works on Supabase: `GRANT langnav_read TO anon` makes anon inherit
    these policies without anon being named here."""
    assert f"TO {API_ANON_ROLE}" in code_only(RLS_SQL)


def test_rls_skips_rather_than_locking_everyone_out():
    """Same reasoning as 005, but the stakes are higher. run.py applies this on
    every load; enabling RLS on an installation with no API role would deny
    every read to a role that does not exist yet, and the tables would be dark
    until someone worked out why."""
    code = code_only(RLS_SQL)
    assert "RAISE NOTICE" in code
    assert "RETURN;" in code


def test_rls_is_applied_after_the_grants():
    """006 checks for the role that 005 grants to, so the order matters."""
    for section in (RUN_PY.split("def _do_load(", 1)[1],
                    RUN_PY.split("if args.schema:", 1)[1].split("if args.load", 1)[0]):
        assert section.index('"005_roles.sql"') < section.index('"006_rls.sql"')


def test_rls_file_is_transactional():
    statements = [
        line for line in RLS_SQL.splitlines()
        if line.strip() and not line.lstrip().startswith("--")
    ]
    assert statements[0].strip() == "BEGIN;"
    assert statements[-1].strip() == "COMMIT;"


def test_rls_has_no_em_dashes_or_local_paths():
    assert RLS_SQL.count(chr(8212)) == 0
    assert ".private" not in RLS_SQL
    assert not re.search(r"\b[A-Za-z]:[\/]", RLS_SQL)
