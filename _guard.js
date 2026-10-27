// Shared request guard (files starting with "_" are not deployed as endpoints).
// No password: the dashboard opens straight to live data. Instead, only accept
// POSTs that come from this dashboard's own pages, so other sites can't use
// these endpoints to spend the CallRail / AssemblyAI / Anthropic keys.
module.exports = function guard(req, res) {
  if (req.method !== 'POST') { res.status(405).json({error:'POST only'}); return false; }
  const origin = req.headers.origin;
  if (origin) {
    let host = '';
    try { host = new URL(origin).host; } catch (e) {}
    const extra = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    if (host !== req.headers.host && !extra.includes(origin)) {
      res.status(403).json({error:'forbidden origin'}); return false;
    }
  }
  return true;
};
