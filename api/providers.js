export default async function handler(req, res) {
  try {
    const token = process.env.AIRTABLE_TOKEN;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableId = process.env.AIRTABLE_TABLE_ID;
    const viewName = process.env.AIRTABLE_VIEW_NAME;

    // sanity check (does NOT leak secrets)
    if (!token || !baseId || !tableId) {
      return res.status(500).json({
        error: "Missing env vars",
        haveToken: Boolean(token),
        baseId: baseId || null,
        tableId: tableId || null,
        viewName: viewName || null,
      });
    }

    // TEMP DEBUG: do NOT use view yet (we’ll add it back once API works)
    const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Airtable API error",
        status: response.status,
        details: text,
      });
    }

    return res.status(200).json(JSON.parse(text));
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: String(err) });
  }
}
