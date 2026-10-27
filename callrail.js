// Proxies CallRail. Client sends {path, query} for v3 API calls, or
// {recordingUrl} to resolve a recording. The token stays server-side.
const guard = require('./_guard');
module.exports = async (req, res) => {
  if (!guard(req, res)) return;
  const token = process.env.CALLRAIL_TOKEN || process.env.CALLRAIL_API_KEY;
  if (!token) return res.status(500).json({error:'CALLRAIL_TOKEN (or CALLRAIL_API_KEY) env var not set'});
  const b = req.body || {};
  try {
    let url;
    if (b.recordingUrl) { url = b.recordingUrl; }
    else {
      const qs = new URLSearchParams(b.query || {}).toString();
      url = 'https://api.callrail.com/v3/' + b.path + (qs ? ('?' + qs) : '');
    }
    const r = await fetch(url, {headers:{Authorization:'Token token=' + token}});
    const text = await r.text();
    res.status(r.status).setHeader('content-type','application/json').send(text);
  } catch (e) { res.status(502).json({error:String(e)}); }
};
