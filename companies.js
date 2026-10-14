// Debug route: lists companies on the account so you can confirm the COM… id
const { cr, send } = require('./_lib');
module.exports = async (req, res) => {
  try {
    const { companies = [] } = await cr('/companies.json?per_page=250');
    send(res, 200, companies.map(c => ({ id: c.id, name: c.name, status: c.status })));
  } catch (e) { send(res, 500, { error: e.message }); }
};
