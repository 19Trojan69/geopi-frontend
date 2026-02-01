export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { paymentId } = req.body || {};
    if (!paymentId) return res.status(400).json({ error: "Missing paymentId" });

    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing PI_API_KEY on server" });

    const url = `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/approve`;

    const r = await fetch(url, {
      method: "POST",
      headers: { authorization: `key ${apiKey}` },
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: "Pi approve failed", details: data });

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: String(e?.message || e) });
  }
}
