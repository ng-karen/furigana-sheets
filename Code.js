const SERVER_URL = 'https://furigana-server-262222190462.us-west1.run.app/furigana';
const SERVER_KEY_PROPERTY = 'FURIGANA_SERVER_KEY';
const FURIGANA_COLOR = '#808080';

// The server takes up to 200 cells and 5,000 characters per request
const MAX_LINES_PER_REQUEST = 200;
const MAX_CHARS_PER_REQUEST = 5000;
// Each user can convert up to 50,000 characters a day
const DAILY_CHAR_LIMIT = 50000;

function onInstall(e) {
  onOpen(e);
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createAddonMenu();
  menu.addItem('Add furigana to selection', 'addFurigana');
  menu.addItem('Remove furigana from selection', 'removeFurigana');
  menu.addToUi();
}

// ─── ADD FURIGANA ─────────────────────────────────────────────────────────────

function addFurigana() {
  const ui = SpreadsheetApp.getUi();
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

  if (cells.some((cell) => cell.text.length > MAX_CHARS_PER_REQUEST)) {
    ui.alert(`A cell is too long. Each cell can have up to ${MAX_CHARS_PER_REQUEST} characters.`);
    return;
  }

  const total = cells.reduce((n, cell) => n + cell.text.length, 0);
  if (!useDailyAllowance(total)) {
    ui.alert('You reached today\'s limit. Please try again tomorrow.');
    return;
  }

  for (const batch of makeBatches(cells)) {
    const results = getFuriganaFromServer(batch.map((cell) => cell.text));
    if (!results) return;

    results.forEach((converted, i) => {
      const row = range.getRow() + batch[i].r;
      const col = range.getColumn() + batch[i].c;
      setRichTextWithColor(sheet.getRange(row, col), converted);
    });
  }
}

function makeBatches(cells) {
  const batches = [];
  let batch = [];
  let chars = 0;
  cells.forEach((cell) => {
    if (batch.length === MAX_LINES_PER_REQUEST || chars + cell.text.length > MAX_CHARS_PER_REQUEST) {
      batches.push(batch);
      batch = [];
      chars = 0;
    }
    batch.push(cell);
    chars += cell.text.length;
  });
  if (batch.length) batches.push(batch);
  return batches;
}

// ─── DAILY LIMIT ──────────────────────────────────────────────────────────────
// Counted per user in their own Google account. Only a number is saved, never text.

function useDailyAllowance(chars) {
  const props = PropertiesService.getUserProperties();
  const today = new Date().toISOString().slice(0, 10);
  const saved = JSON.parse(props.getProperty('DAILY_USAGE') || '{}');
  const used = saved.day === today ? saved.chars : 0;
  if (used + chars > DAILY_CHAR_LIMIT) return false;
  props.setProperty('DAILY_USAGE', JSON.stringify({ day: today, chars: used + chars }));
  return true;
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

// ─── FURIGANA SERVER ──────────────────────────────────────────────────────────
// Readings come from a Japanese dictionary on the add-on's own server. No AI.
// The server password is kept in Script Properties, not in this code.

function getFuriganaFromServer(lines) {
  const ui = SpreadsheetApp.getUi();
  const key = PropertiesService.getScriptProperties().getProperty(SERVER_KEY_PROPERTY);
  if (!key) {
    ui.alert('Furigana is not set up yet. Please try again later.');
    return null;
  }

  const options = {
    method: 'POST',
    contentType: 'application/json',
    headers: { 'X-Furigana-Key': key },
    payload: JSON.stringify({ lines }),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(SERVER_URL, options);
    const json = JSON.parse(response.getContentText());
    if (response.getResponseCode() !== 200) {
      ui.alert('Error: ' + (json.error || response.getResponseCode()));
      return null;
    }
    return json.lines;
  } catch (e) {
    ui.alert('Error: ' + e.message);
    return null;
  }
}
