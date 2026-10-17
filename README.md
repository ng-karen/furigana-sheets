# Furigana for Google Sheets

Add furigana (hiragana readings) to Japanese text in Google Sheets.

Select some cells, click one menu item, and each kanji word gets its reading in gray brackets:

```
東京は日本の首都です。
東京[とうきょう]は日本[にほん]の首都[しゅと]です。
```

You can remove the readings again with one click.

<!-- Screenshot goes here -->
![Screenshot](docs/screenshot.png)

## What you need

A free Gemini API key. Get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

The add-on uses Gemini to work out the readings. Each person uses their own key, so there is no shared cost.

## Install

### Option 1: Make a copy (easiest)

1. Open this link: [Make a copy](https://docs.google.com/spreadsheets/d/SHEET_ID/copy) <!-- Replace SHEET_ID with the ID of a shared sheet that has the script -->
2. Click **Make a copy**.
3. The script comes with your copy.

### Option 2: Copy and paste the code

1. Open a Google Sheet.
2. Click **Extensions > Apps Script**.
3. Delete what's in `Code.gs`, then paste in everything from [Code.js](Code.js).
4. Click the gear icon (**Project Settings**) and turn on **Show "appsscript.json" manifest file in editor**.
5. Open `appsscript.json` and replace it with [appsscript.json](appsscript.json).
6. Click **Save**, then reload your sheet.

## How to use

1. Click **Extensions > Furigana > Set Gemini API key** and paste your key. You only do this once.
2. Select the cells you want.
3. Click **Extensions > Furigana > Add furigana to selection**.
4. To take the readings out, click **Remove furigana from selection**.

The first time, Google asks you to allow access. The add-on can only:

- See and edit the spreadsheet it is open in
- Show its menu and pop-up messages
- Send your selected text to Gemini to get the readings

If the menu has a different name, look under **Extensions** for the name of your Apps Script project.

## Privacy

Your selected text goes to Google's Gemini API to get the readings. Nothing else is stored or shared. See [privacy.md](privacy.md).

## Coming soon

A Google Workspace Marketplace version, so you can install it in one click.

## License

MIT. See [LICENSE](LICENSE).
