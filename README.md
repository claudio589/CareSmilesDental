# CARE Smiles Dental — Call Intelligence Dashboard

Care Hood River Dentistry (Dr. Andy Ray Burton), Hood River OR. Live CallRail data, month-to-date by default,
call times in Pacific. Paid calls only (Google Ads + LSA, organic GMB listing number excluded). LSA calls are split out
by tracking-number pool (Local Services Ads number).

AssemblyAI transcribes each recorded call (language detection, speaker labels + practice/insurer key terms); Claude grades
it on the 8-stage front-desk standard and classifies procedure, booked / not-booked reasons (main > secondary) and
follow-up bucket.

- CallRail account 561967665 · company (UI id) 624861441 (COM... id resolved on load)
- Google Ads customer ID 464-245-1686

## Deploy
Vercel project `caresmilesdental` (https://caresmilesdental.vercel.app), connected to this repo. Push to `main` = deploy.

Env vars: `CALLRAIL_TOKEN`, `ASSEMBLYAI_KEY`, `ANTHROPIC_API_KEY` (required), `ALLOWED_ORIGINS` (optional).
The Oct 14 names `CALLRAIL_API_KEY` / `ASSEMBLYAI_API_KEY` are also accepted.

The old routes from the Oct 14 build (`api/calls.js`, `api/recording.js`, `api/companies.js`, `api/transcribe-start.js`,
`api/transcribe-status.js`, `api/_lib.js`) are no longer used and can be deleted from the repo.
