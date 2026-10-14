const { send } = require('./_lib');

const SYSTEM = `You analyze inbound phone calls for CARE Smiles (Care Hood River Dentistry), Hood River, Oregon — Dr. Andy Ray Burton.
Practice context: premium, private-pay, biologic/regenerative dentistry. ABOI-certified implant provider. Core growth services: dental implants (single, full-arch/All-on-X, complex/bone loss, zygomatic) and sedation dentistry. Does NOT accept Medicaid (OHP in Oregon, Apple Health in Washington). Service area: Hood River, White Salmon, Bingen, Underwood, The Dalles and the Columbia River Gorge.
Calls may be in English or Spanish. Speaker labels may be unknown — infer office staff vs caller from context.

Return ONLY a JSON object, no markdown, with exactly these keys:
{
 "caller_name": string ("" if unknown),
 "call_type": one of ["New Patient","Existing Patient","Vendor/Solicitor","Wrong Number/Spam","Other"],
 "outcome": one of ["Booked","Follow-up Needed","Not Booked","Missed/Voicemail","Not Applicable"],
 "lost_reason": one of ["Insurance/Medicaid","Price","Availability/Scheduling","Not Answered","Service Not Offered","Shopping/Info Only","Location/Distance","Other",""] ("" unless outcome is Not Booked, Follow-up Needed or Missed/Voicemail),
 "procedure": one of ["Implants","Full-Arch/All-on-X","Sedation","Cosmetic","Emergency/Pain","Extraction","Crowns/Restorative","Hygiene/General","Other","Unknown"],
 "high_value": boolean (implant, full-arch, sedation, or multi-tooth treatment interest),
 "lead_quality": integer 1-10,
 "agent_score": integer 1-10 (staff handling; 0 if no staff spoke),
 "opportunity": boolean (a real prospective patient who did NOT book and is worth a callback),
 "next_step": string (one specific action, "" if none),
 "summary": string (2 sentences max, plain English),
 "insurance_mentioned": string ("" if none)
}`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  try {
    const { meta = {}, text = '', basis = 'metadata' } = req.body || {};
    const user = `Call metadata: ${JSON.stringify(meta)}\nAnalysis basis: ${basis}\n\n${basis === 'transcript' ? 'Transcript' : 'Available notes'}:\n${text || '(none — infer only from metadata; be conservative)'}`;
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001',
        max_tokens: 700,
        system: SYSTEM,
        messages: [{ role: 'user', content: user.slice(0, 60000) }]
      })
    });
    const d = await r.json();
    if (!r.ok) return send(res, 500, { error: d.error?.message || 'Anthropic error' });
    const raw = (d.content || []).map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
    const json = JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
    send(res, 200, { ...json, basis });
  } catch (e) { send(res, 500, { error: e.message }); }
};
