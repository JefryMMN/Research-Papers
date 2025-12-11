export default async function handler(req, res) {
  const urlParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
  const category = urlParams.get("category") || "cs.AI";
  const maxResults = urlParams.get("maxResults") || "500";

  const apiUrl = `https://export.arxiv.org/api/query?search_query=cat:${category}&start=0&max_results=${maxResults}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.text();

    // ✅ Allow browser access
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    res.status(200).send(data);
  } catch (error) {
    console.error("❌ Proxy fetch failed:", error);
    res.status(500).json({ error: "Failed to fetch from arXiv" });
  }
}
