const API_KEY_PROPERTY = 'GEMINI_API_KEY';
const FURIGANA_COLOR = '#808080';

function onInstall(e) {
  onOpen(e);
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createAddonMenu();
  menu.addItem('Add furigana to selection', 'addFurigana');
  menu.addItem('Remove furigana from selection', 'removeFurigana');
  menu.addSeparator();
  menu.addItem('Set Gemini API key', 'setApiKey');
  menu.addToUi();
}

// ─── API KEY ──────────────────────────────────────────────────────────────────
// Each user's key is saved to their own Google account only.

function setApiKey() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Set Gemini API key',
    'Paste your Gemini API key. Get a free one at aistudio.google.com/apikey',
    ui.ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() !== ui.Button.OK) return;

  const key = response.getResponseText().trim();
  if (!key) return;
  PropertiesService.getUserProperties().setProperty(API_KEY_PROPERTY, key);
  ui.alert('Your key is saved.');
}

function getApiKey() {
  return PropertiesService.getUserProperties().getProperty(API_KEY_PROPERTY);
}

// ─── ADD FURIGANA ─────────────────────────────────────────────────────────────

function addFurigana() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = SpreadsheetApp.getActiveRange();
  const values = range.getValues();

  const cells = [];
  values.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell && typeof cell === 'string') {
        cells.push({ r, c, text: cell.trim() });
      }
    })
  );

  if (cells.length === 0) return;

  const combined = cells.map((cell, i) => `${i + 1}. ${cell.text}`).join('\n');
  const result = getFuriganaFromAPI(combined);
  if (!result) return;

  const lines = result.split('\n');
  lines.forEach((line, i) => {
    const match = line.match(/^\d+\.\s+(.+)$/);
    if (match && cells[i]) {
      const row = range.getRow() + cells[i].r;
      const col = range.getColumn() + cells[i].c;
      const targetCell = sheet.getRange(row, col);
      setRichTextWithColor(targetCell, match[1]);
    }
  });
}

// ─── COLOR FURIGANA GRAY ──────────────────────────────────────────────────────

function setRichTextWithColor(cell, converted) {
  const builder = SpreadsheetApp.newRichTextValue().setText(converted);

  const regex = /\[[^\]]*\]/g;
  let match;
  while ((match = regex.exec(converted)) !== null) {
    builder.setTextStyle(
      match.index,
      match.index + match[0].length,
      SpreadsheetApp.newTextStyle().setForegroundColor(FURIGANA_COLOR).build()
    );
  }

  cell.setRichTextValue(builder.build());
}

// ─── REMOVE FURIGANA ──────────────────────────────────────────────────────────

function removeFurigana() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const range = SpreadsheetApp.getActiveRange();
  const numRows = range.getNumRows();
  const numCols = range.getNumColumns();

  for (let r = 1; r <= numRows; r++) {
    for (let c = 1; c <= numCols; c++) {
      const cell = range.getCell(r, c);
      const richText = cell.getRichTextValue();
      const text = richText ? richText.getText() : String(cell.getValue());
      if (!text) continue;
      const cleaned = text.replace(/\[[^\]]*\]/g, '').trim();
      cell.setValue(cleaned);
    }
  }
}

// ─── GEMINI API ───────────────────────────────────────────────────────────────

function getFuriganaFromAPI(text) {
  const apiKey = getApiKey();
  if (!apiKey) {
    SpreadsheetApp.getUi().alert('Please add your Gemini API key first: Extensions > Furigana > Set Gemini API key.');
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

  const prompt = `You are a Japanese language assistant. Add hiragana readings to kanji words in each numbered line below.
Format: attach the hiragana reading in square brackets immediately after each kanji word.
Only add readings to words that contain kanji. Leave hiragana, katakana, and punctuation as-is.
Return the same numbered list with converted text only, nothing else.

Example input:
1. 東京は日本の首都です。
Example output:
1. 東京[とうきょう]は日本[にほん]の首都[しゅと]です。

Now convert:
${text}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());
    return json.candidates[0].content.parts[0].text.trim();
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error: ' + e.message);
    return null;
  }
}