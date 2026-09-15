/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMPLITUDE_API_KEY?: string;
  // Base URL of the read-only API, eg. http://localhost:3000. When unset the
  // app loads every entity from the TSV files in public/data, as it always has.
  readonly VITE_API_URL?: string;
  // Supabase's anonymous key, sent as `apikey` and as a bearer token. Not
  // needed against a bare PostgREST. Public by design - what constrains a
  // caller is the anon role's grants plus the RLS policies in 006_rls.sql.
  // NEVER put a service-role key here; it bypasses RLS.
  readonly VITE_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
