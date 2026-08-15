"""Environment and path configuration for the lang-nav ETL.

Reads backend/.env (gitignored). Nothing here has a default password: if a
password is missing the ETL fails loudly rather than silently trying to
connect as the current OS user.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

# backend/etl/config.py -> backend/ -> repository root
BACKEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND_DIR.parent
SCHEMA_DIR = BACKEND_DIR / "schema"

load_dotenv(BACKEND_DIR / ".env")


class ConfigError(RuntimeError):
    """Raised when required configuration is missing or obviously wrong."""


def _require(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise ConfigError(
            f"{name} is not set. Fill it in at backend/.env "
            f"(copy backend/.env.example if the file is missing)."
        )
    return value


def _optional(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


@dataclass(frozen=True)
class DbConfig:
    """A single Postgres connection target."""

    host: str
    port: int
    user: str
    password: str
    dbname: str
    # Raised for the loading session. A local PostgreSQL has no limit by
    # default; Supabase enforces 2 minutes on the database, and several derive
    # steps are single statements that legitimately exceed it.
    statement_timeout: str = "30min"

    def conninfo(self) -> str:
        # psycopg accepts a keyword/value conninfo string. Values are quoted so
        # that a password containing spaces or symbols does not break parsing.
        def q(v: str) -> str:
            return "'" + str(v).replace("\\", "\\\\").replace("'", "\\'") + "'"

        return (
            f"host={q(self.host)} port={q(self.port)} user={q(self.user)} "
            f"password={q(self.password)} dbname={q(self.dbname)}"
        )

    def redacted(self) -> str:
        """Safe for logging. Never print conninfo() itself."""
        return f"{self.user}@{self.host}:{self.port}/{self.dbname}"


def bootstrap_db() -> DbConfig:
    """Superuser connection to the maintenance database.

    Used only by scripts/bootstrap_database.py to create the langnav database
    and role. The ETL itself never uses this.
    """
    return DbConfig(
        host=_require("PGHOST"),
        port=int(_optional("PGPORT", "5432")),
        user=_require("BOOTSTRAP_USER"),
        password=_require("BOOTSTRAP_PASSWORD"),
        dbname=_optional("BOOTSTRAP_DB", "postgres"),
        statement_timeout=_optional("LANGNAV_STATEMENT_TIMEOUT", "30min"),
    )


def langnav_db() -> DbConfig:
    """The application connection the ETL uses for every run."""
    return DbConfig(
        host=_require("PGHOST"),
        port=int(_optional("PGPORT", "5432")),
        user=_require("LANGNAV_USER"),
        password=_require("LANGNAV_PASSWORD"),
        dbname=_require("LANGNAV_DB"),
        statement_timeout=_optional("LANGNAV_STATEMENT_TIMEOUT", "30min"),
    )


# The two API role names are CONSTANTS, not settings. schema/005_roles.sql
# grants to them by name and a .sql file cannot read .env, so making these
# configurable would let the two disagree - the grants would silently apply to a
# role nobody connects as. Only the password varies per installation.
API_ANON_ROLE = "langnav_read"
API_AUTHENTICATOR_ROLE = "langnav_authenticator"


def api_authenticator_db() -> DbConfig:
    """The role PostgREST logs in as, connecting to the langnav database.

    Holds no privileges of its own; it exists to SET ROLE to API_ANON_ROLE.
    Created by scripts/bootstrap_database.py --api-roles.
    """
    return DbConfig(
        host=_require("PGHOST"),
        port=int(_optional("PGPORT", "5432")),
        user=API_AUTHENTICATOR_ROLE,
        password=_require("LANGNAV_AUTHENTICATOR_PASSWORD"),
        dbname=_require("LANGNAV_DB"),
        statement_timeout=_optional("LANGNAV_STATEMENT_TIMEOUT", "30min"),
    )


@dataclass(frozen=True)
class PostgrestSettings:
    """Everything scripts/write_postgrest_config.py puts in postgrest.conf
    besides the connection itself."""

    cors_origins: str
    max_rows: str
    server_port: str


def postgrest_settings() -> PostgrestSettings:
    """Deployment-shaped settings for the API, with defaults suited to a local
    developer rather than to production.

    CORS defaults to this project's own local servers rather than to "*".
    PostgREST treats an empty value as "allow any origin", which is fine on
    localhost and wrong anywhere else, so the default names origins and a
    deployment overrides it.

    BOTH Vite ports are listed on purpose: 5173 is `npm run dev` and 4173 is
    `npm run preview`, which is how the production build gets tested. Listing
    only the first blocks the preview, and the symptom is a CORS error in the
    browser rather than anything that mentions this file.

    MAX ROWS IS A BACKSTOP, NOT A PAGE SIZE, and the default is deliberately
    higher than any table here. See the warning in write_postgrest_config.py
    before lowering it.
    """
    return PostgrestSettings(
        cors_origins=_optional(
            "LANGNAV_API_CORS_ORIGINS",
            "http://localhost:5173,http://localhost:4173",
        ),
        max_rows=_optional("LANGNAV_API_MAX_ROWS", "100000"),
        server_port=_optional("LANGNAV_API_PORT", "3000"),
    )


def target_db_name() -> str:
    """The one database name the bootstrap script is permitted to create."""
    name = _require("LANGNAV_DB")
    if name in {"postgres", "template0", "template1"}:
        raise ConfigError(
            f"LANGNAV_DB={name!r} is a system database. Refusing to proceed."
        )
    return name


def data_root() -> Path:
    """Absolute path to the directory holding the source TSV files."""
    root = REPO_ROOT / _optional("DATA_ROOT", "public/data")
    if not root.is_dir():
        raise ConfigError(f"DATA_ROOT does not exist: {root}")
    return root
