// Shared helpers — CallRail account + company resolution
const ACCOUNT = process.env.CALLRAIL_ACCOUNT_ID || '561967665';
const LEGACY_COMPANY = '624861441'; // numeric id from the CallRail UI URL
const BASE = `https://api.callrail.com/v3/a/${ACCOUNT}`;
let companyCache = null;

async function cr(path) {
  const r = await fetch(BASE + path, {
    headers: { Authorization: `Token token="${(process.env.CALLRAIL_API_KEY || process.env.CALLRAIL_TOKEN)}"` }
  });
  const text = await r.text();
  let body; try { body = JSON.parse(text); } catch { body = { raw: text }; }
  if (!r.ok) { const e = new Error(`CallRail ${r.status}: ${text.slice(0, 300)}`); e.status = r.status; throw e; }
  return body;
}

// The UI shows a numeric company id; the v3 API wants the COM… id.
// Set CALLRAIL_COMPANY_ID to skip lookup. Otherwise match legacy id, then name.
async function resolveCompany() {
  if (process.env.CALLRAIL_COMPANY_ID) return process.env.CALLRAIL_COMPANY_ID;
  if (companyCache) return companyCache;
  const { companies = [] } = await cr('/companies.json?per_page=250');
  let hit = companies.find(c => (c.name || '').trim().toLowerCase() === 'care smiles dental');
  if (!hit) hit = companies.find(c => JSON.stringify(c).includes(LEGACY_COMPANY));
  if (!hit) hit = companies.find(c => /care/i.test(c.name) && /(smile|hood)/i.test(c.name));
  if (!hit) hit = companies.find(c => /care/i.test(c.name));
  if (!hit) throw new Error('Care Smiles company not found — set CALLRAIL_COMPANY_ID (see /api/companies)');
  companyCache = hit.id;
  return hit.id;
}

function send(res, code, obj) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.status(code).send(JSON.stringify(obj));
}

module.exports = { cr, resolveCompany, send, ACCOUNT };
