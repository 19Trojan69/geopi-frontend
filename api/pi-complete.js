export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { paymentId, txid } = req.body || {};
    if (!paymentId) return res.status(400).json({ error: "Missing paymentId" });
    if (!txid) return res.status(400).json({ error: "Missing txid" });

    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing PI_API_KEY on server" });

    const url = `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/complete`;

    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) return res.status(r.status).json({ error: "Pi complete failed", details: data });

    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: String(e?.message || e) });
  }
}

