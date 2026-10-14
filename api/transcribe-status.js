const { send } = require('./_lib');
module.exports = async (req, res) => {
  try {
    const r = await fetch(`https://api.assemblyai.com/v2/transcript/${encodeURIComponent(req.query.job)}`, {
      headers: { authorization: (process.env.ASSEMBLYAI_API_KEY || process.env.ASSEMBLYAI_KEY) }
    });
    const d = await r.json();
    if (d.status === 'completed') {
      const text = (d.utterances && d.utterances.length)
        ? d.utterances.map(u => `Speaker ${u.speaker}: ${u.text}`).join('\n')
        : (d.text || '');
      return send(res, 200, { status: 'completed', text, language: d.language_code || '' });
    }
    send(res, 200, { status: d.status, error: d.error || null });
  } catch (e) { send(res, 500, { error: e.message }); }
};
