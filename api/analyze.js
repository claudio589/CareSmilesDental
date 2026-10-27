// Proxies Anthropic Messages. Client sends {body} (the full request minus the
// key); we inject x-api-key server-side. maxDuration is bumped for Opus calls.
const guard = require('./_guard');
module.exports = async (req, res) => {
  if (!guard(req, res)) return;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({error:'ANTHROPIC_API_KEY env var not set'});
  const b = req.body || {};
  if (!b.body) return res.status(400).json({error:'missing body'});
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {method:'POST',
      headers:{'x-api-key':key,'anthropic-version':'2023-06-01','content-type':'application/json'},
      body: JSON.stringify(b.body)});
    const text = await r.text();
    res.status(r.status).setHeader('content-type','application/json').send(text);
  } catch (e) { res.status(502).json({error:String(e)}); }
};
