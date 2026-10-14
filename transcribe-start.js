const { cr, send } = require('./_lib');
module.exports = async (req, res) => {
  try {
    const id = req.query.id;
    const key = process.env.ASSEMBLYAI_API_KEY || process.env.ASSEMBLYAI_KEY;
    if (!key) return send(res, 500, { error: 'AssemblyAI key missing in Vercel env (ASSEMBLYAI_KEY)' });
    const rec = await cr(`/calls/${encodeURIComponent(id)}/recording.json`);
    if (!rec.url) return send(res, 404, { error: 'CallRail returned no recording URL' });
    // Resolve CallRail's redirect to the actual audio file so AssemblyAI can download it
    let audio = rec.url;
    try {
      const h = await fetch(rec.url, { redirect: 'manual' });
      const loc = h.headers.get('location');
      if (loc) audio = loc;
    } catch {}
    const r = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: { authorization: key, 'content-type': 'application/json' },
      body: JSON.stringify({ audio_url: audio, speaker_labels: true, language_detection: true })
    });
    const d = await r.json();
    if (!r.ok) return send(res, 500, { error: 'AssemblyAI: ' + (d.error || r.status) });
    send(res, 200, { jobId: d.id });
  } catch (e) { send(res, 500, { error: e.message }); }
};
