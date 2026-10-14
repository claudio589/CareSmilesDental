const { cr, resolveCompany, send } = require('./_lib');

const FULL = 'source,source_name,keywords,campaign,medium,landing_page_url,gclid,tags,note,lead_status,first_call,company_name,value,utm_source,utm_medium,utm_campaign,utm_term,transcription,call_summary';
const SAFE = 'source,source_name,keywords,campaign,medium,landing_page_url,gclid,tags,note,lead_status,first_call,company_name,utm_campaign,utm_term';

async function pull(company, start, end, fields) {
  const out = [];
  for (let page = 1; page <= 30; page++) {
    const q = new URLSearchParams({
      company_id: company, start_date: start, end_date: end,
      per_page: '250', page: String(page), fields, sort: 'start_time', order: 'desc'
    });
    const d = await cr('/calls.json?' + q);
    out.push(...(d.calls || []));
    if (!d.total_pages || page >= d.total_pages) break;
  }
  return out;
}

module.exports = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const start = req.query.start || new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
    const end = req.query.end || today;
    const company = await resolveCompany();
    let calls;
    try { calls = await pull(company, start, end, FULL); }
    catch (e) { if (e.status === 400) calls = await pull(company, start, end, SAFE); else throw e; }

    const norm = calls.map(c => ({
      id: c.id,
      name: c.customer_name || '',
      phone: c.customer_phone_number || '',
      city: [c.customer_city, c.customer_state].filter(Boolean).join(', '),
      start: c.start_time,
      duration: c.duration || 0,
      direction: c.direction,
      answered: !!c.answered,
      voicemail: !!c.voicemail,
      firstCall: !!c.first_call,
      hasRecording: !!c.recording,
      source: c.source_name || c.source || 'Unknown',
      medium: c.medium || '',
      campaign: c.campaign || c.utm_campaign || '',
      keyword: c.keywords || c.utm_term || '',
      landing: c.landing_page_url || '',
      gclid: !!c.gclid,
      tracking: c.tracking_phone_number || '',
      tags: (c.tags || []).map(t => (typeof t === 'string' ? t : t.name)),
      note: c.note || '',
      leadStatus: c.lead_status || '',
      crTranscript: typeof c.transcription === 'string' ? c.transcription : '',
      crSummary: c.call_summary || ''
    }));
    send(res, 200, { company, start, end, count: norm.length, calls: norm });
  } catch (e) { send(res, 500, { error: e.message }); }
};
