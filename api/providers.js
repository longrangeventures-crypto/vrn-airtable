export default async function handler(req, res) {
  try {
    const AIRTABLE_PUBLIC_VIEW =
      "https://airtable.com/appqTkwG4v9gpDjl8/shrAUcmQU0GoSZYbu?format=json";

    const response = await fetch(AIRTABLE_PUBLIC_VIEW);
    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to load providers" });
  }
}
