// Returns a short-lived signed recording URL for playback
const { cr, send } = require('./_lib');
module.exports = async (req, res) => {
  try {
    const d = await cr(`/calls/${encodeURIComponent(req.query.id)}/recording.json`);
    send(res, 200, { url: d.url });
  } catch (e) { send(res, e.status === 404 ? 404 : 500, { error: e.message }); }
};
