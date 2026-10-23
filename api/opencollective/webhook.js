/* Generic Open Collective notifications are unsigned. This receiver records only
   non-personal event identifiers. It NEVER treats these messages as proof of payment,
   issues cards, or grants access. Durable verified fulfillment is a separate stage. */
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET' || req.method === 'HEAD') {
    return res.status(200).json({ service: 'ONCE Open Collective webhook', status: 'ready', mode: 'notification-receipt-only' });
  }
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, HEAD, POST'); return res.status(405).json({ error: 'Method not allowed' }); }
  if (Number(req.headers['content-length'] || 0) > 262144) return res.status(413).json({ error: 'Payload too large' });
  try { if (Buffer.byteLength(typeof req.body === 'string' ? req.body : JSON.stringify(req.body) || '', 'utf8') > 262144) return res.status(413).json({ error: 'Payload too large' }); } catch { return res.status(400).json({ error: 'Invalid JSON' }); }
  let event = req.body;
  if (typeof event === 'string') { try { event = JSON.parse(event); } catch { return res.status(400).json({ error: 'Invalid JSON' }); } }
  if (!event || Array.isArray(event) || typeof event.type !== 'string' || !/^[a-z0-9_.-]{1,100}$/i.test(event.type) || (!Number.isSafeInteger(event.id) || event.id <= 0)) return res.status(400).json({ error: 'Expected Open Collective activity with integer id and event type' });
  if (event.CollectiveId !== 637071 && event.data?.collective?.slug !== 'once-collective') return res.status(422).json({ error: 'Activity is not for ONCE Collective' });
  // Do not log contributor names, emails, transaction descriptions, or complete payloads.
  console.info(JSON.stringify({ integration: 'opencollective', activityId: event.id, type: event.type, collectiveId: 637071, verified: false }));
  return res.status(200).json({ received: true, activityId: event.id, verified: false, mode: 'notification-receipt-only' });
};
