export default async function handler(req, res) {
  try {
    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) return res.status(500).json({ ok: false, error: "Missing PI_API_KEY" });

    return res.status(200).json({
      ok: true,
      env: "PI_API_KEY is set",
      keyPrefix: String(apiKey).slice(0, 6) + "…",
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e?.message || e) });
  }
}
