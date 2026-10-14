const { cr, send } = require('./_lib');
module.exports = async (req, res) => {
  try {
    const id = req.query.id;
    const rec = await cr(`/calls/${encodeURIComponent(id)}/recording.json`);
    if (!rec.url) return send(res, 404, { error: 'No recording' });
    const r = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: { authorization: (process.env.ASSEMBLYAI_API_KEY || process.env.ASSEMBLYAI_KEY), 'content-type': 'application/json' },
      body: JSON.stringify({ audio_url: rec.url, speaker_labels: true, language_detection: true })
    });
    const d = await r.json();
    if (!r.ok) return send(res, 500, { error: d.error || 'AssemblyAI error' });
    send(res, 200, { jobId: d.id });
  } catch (e) { send(res, 500, { error: e.message }); }
};
