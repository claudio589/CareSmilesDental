// Proxies AssemblyAI. {op:'create', audio_url} starts a job; {op:'status', id}
// polls it. The browser keeps the poll loop, so each call is short.
const guard = require('./_guard');
module.exports = async (req, res) => {
  if (!guard(req, res)) return;
  const key = process.env.ASSEMBLYAI_KEY || process.env.ASSEMBLYAI_API_KEY;
  if (!key) return res.status(500).json({error:'ASSEMBLYAI_KEY (or ASSEMBLYAI_API_KEY) env var not set'});
  const b = req.body || {};
  try {
    let r;
    if (b.op === 'create') {
      const job = {audio_url: b.audio_url, language_detection:true, speaker_labels:true};
      // Key terms (practice / location / insurer names) the model should hear correctly.
      // Max 6 words per phrase; capped well under AssemblyAI's limit.
      const terms = Array.isArray(b.keyterms) ? b.keyterms.map(t => String(t).trim()).filter(t => t && t.split(/\s+/).length <= 6).slice(0, 100) : [];
      const create = body => fetch('https://api.assemblyai.com/v2/transcript', {method:'POST',
        headers:{Authorization:key,'Content-Type':'application/json'}, body: JSON.stringify(body)});
      r = await create(terms.length ? Object.assign({keyterms_prompt: terms}, job) : job);
      // If the account/model rejects key terms, transcribe without them rather than fail.
      if (terms.length && r.status === 400) r = await create(job);
    } else if (b.op === 'status') {
      r = await fetch('https://api.assemblyai.com/v2/transcript/' + b.id, {headers:{Authorization:key}});
    } else return res.status(400).json({error:'bad op'});
    const text = await r.text();
    res.status(r.status).setHeader('content-type','application/json').send(text);
  } catch (e) { res.status(502).json({error:String(e)}); }
};
