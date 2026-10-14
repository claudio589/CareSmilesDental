# CARE Smiles · Call Intelligence Dashboard

Care Hood River Dentistry (Dr. Andy Ray Burton). CallRail → AssemblyAI → Claude, deployed on Vercel. All keys server-side.

- CallRail account: 561967665 · company (UI id): 624861441
- Google Ads customer ID: 464-245-1686

## Env vars (Vercel → Settings → Environment Variables)
CALLRAIL_API_KEY      required
ASSEMBLYAI_API_KEY    required
ANTHROPIC_API_KEY     required
CALLRAIL_ACCOUNT_ID   optional (defaults to 561967665)
CALLRAIL_COMPANY_ID   optional — the COM… id. If unset, auto-resolves by matching 624861441, then a "Care" company name.
ANTHROPIC_MODEL       optional (defaults to claude-haiku-4-5-20251001)

## Deploy
vercel --prod   (or push to GitHub and import)

After deploy, hit /api/companies once to confirm the right COM… id; pin it in CALLRAIL_COMPANY_ID.

## Analysis cascade
CallRail transcript → AssemblyAI transcript (recordings ≥15s) → CallRail call summary → agent note → tags → metadata only.
Results cache in the browser (localStorage) so each call is only transcribed/analyzed once per browser. "Re-analyze all" forces a rerun.

## Routes
/api/calls?start=YYYY-MM-DD&end=YYYY-MM-DD
/api/recording?id=CAL…
/api/transcribe-start?id=CAL…  → /api/transcribe-status?job=…
/api/analyze (POST)
/api/companies (debug)
