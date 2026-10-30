const path = require("path");
const kuromoji = require("kuromoji");

const DICT_PATH = path.join(path.dirname(require.resolve("kuromoji")), "..", "dict");

// Fixes for readings the dictionary gets wrong in everyday text
const CORRECTIONS = [
  ["日本[にっぽん]", "日本[にほん]"],
  ["一[いち]日[にち]中[ちゅう]", "一日中[いちにちじゅう]"],
  ["一[いち]日[にち]", "一日[いちにち]"],
  ["映画[えいが]館[かん]", "映画館[えいがかん]"],
  ["生物[せいぶつ]学[がく]", "生物学[せいぶつがく]"],
];

const toHiragana = (s) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
const hasKanji = (s) => /[々一-鿿]/.test(s);

let tokenizerPromise = null;

function getTokenizer() {
  if (!tokenizerPromise) {
    tokenizerPromise = new Promise((resolve, reject) => {
      kuromoji.builder({ dicPath: DICT_PATH }).build((err, tokenizer) => (err ? reject(err) : resolve(tokenizer)));
    });
  }
  return tokenizerPromise;
}

// One word: 読み + reading よ → 読[よ]み (kana at the end stays outside the brackets)
function annotateToken(token) {
  const surface = token.surface_form;
  if (!hasKanji(surface) || !token.reading || token.reading === "*") return surface;

  let base = surface;
  let reading = toHiragana(token.reading);
  let tail = "";
  while (base.length && reading.length && !hasKanji(base.slice(-1)) && toHiragana(base.slice(-1)) === reading.slice(-1)) {
    tail = base.slice(-1) + tail;
    base = base.slice(0, -1);
    reading = reading.slice(0, -1);
  }
  return `${base}[${reading}]${tail}`;
}

async function addFurigana(text) {
  const tokenizer = await getTokenizer();
  let out = tokenizer.tokenize(text).map(annotateToken).join("");
  for (const [from, to] of CORRECTIONS) out = out.split(from).join(to);
  return out;
}

module.exports = { addFurigana, getTokenizer };
