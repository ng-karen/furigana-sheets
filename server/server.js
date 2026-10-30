// Furigana server for the Furigana for Google Sheets add-on.
// Text is processed in memory and never stored or logged.

const http = require("http");
const crypto = require("crypto");
const { addFurigana, getTokenizer } = require("./furigana");

const PORT = process.env.PORT || 8080;
const SECRET = process.env.FURIGANA_SECRET || "";
const MAX_LINES = 200;
const MAX_CHARS = 5000;

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function secretMatches(given) {
  if (!SECRET || typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(SECRET);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/healthz") return send(res, 200, { ok: true });
  if (req.method !== "POST" || req.url !== "/furigana") return send(res, 404, { error: "Not found" });
  if (!secretMatches(req.headers["x-furigana-key"])) return send(res, 401, { error: "Unauthorized" });

  let raw = "";
  let tooBig = false;
  req.setEncoding("utf8");
  req.on("data", (chunk) => {
    if (tooBig) return;
    raw += chunk;
    if (raw.length > MAX_CHARS * 8) {
      tooBig = true;
      raw = "";
      send(res, 413, { error: `Too much text. Limit: ${MAX_LINES} cells and ${MAX_CHARS} characters.` });
    }
  });
  req.on("end", async () => {
    if (tooBig) return;
    let lines;
    try {
      lines = JSON.parse(raw).lines;
    } catch (e) {
      return send(res, 400, { error: "Body must be JSON: {\"lines\": [\"...\"]}" });
    }
    if (!Array.isArray(lines) || lines.some((l) => typeof l !== "string")) {
      return send(res, 400, { error: "lines must be a list of strings" });
    }
    const total = lines.reduce((n, l) => n + l.length, 0);
    if (lines.length > MAX_LINES || total > MAX_CHARS) {
      return send(res, 413, { error: `Too much text. Limit: ${MAX_LINES} cells and ${MAX_CHARS} characters.` });
    }
    try {
      const results = await Promise.all(lines.map(addFurigana));
      send(res, 200, { lines: results });
    } catch (e) {
      send(res, 500, { error: "Could not add furigana" });
    }
  });
});

if (!SECRET) {
  console.error("FURIGANA_SECRET is not set. Refusing to start.");
  process.exit(1);
}

// Load the dictionary before taking traffic
getTokenizer().then(() => {
  server.listen(PORT, () => console.log(`Furigana server listening on ${PORT}`));
});
