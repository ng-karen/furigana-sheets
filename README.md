# Furigana for Google Sheets

Add furigana (hiragana readings) to Japanese text in Google Sheets.

Select some cells, click one menu item, and each kanji word gets its reading in gray brackets:

```
東京は日本の首都です。
東京[とうきょう]は日本[にほん]の首都[しゅと]です。
```

You can remove the readings again with one click.

**[Install from the Google Workspace Marketplace](https://workspace.google.com/marketplace/app/furigana_for_google_sheets/262222190462)**

<!-- Screenshot goes here -->
![Screenshot](docs/screenshot.png)

## How it works

The readings come from a Japanese dictionary ([kuromoji](https://github.com/takuyaa/kuromoji.js)) on a small server. No AI is used, and you don't need an API key.

The server code is in [server/](server). It keeps nothing: it reads your text, adds the readings, and sends them back.

## How to use

1. Select the cells you want.
2. Click **Extensions > Furigana > Add furigana to selection**.
3. To take the readings out, click **Remove furigana from selection**.

The first time, Google asks you to allow access. The add-on can only:

- See and edit the spreadsheet it is open in
- Show its menu and pop-up messages
- Send your selected text to the furigana server to get the readings

## Run your own copy

1. Deploy the server to Google Cloud Run. See [server/deploy.sh](server/deploy.sh). Change the project name in it to yours.
2. Open a Google Sheet and click **Extensions > Apps Script**.
3. Paste in [Code.js](Code.js) and [appsscript.json](appsscript.json). Change `SERVER_URL` to your server's address.
4. In **Project Settings > Script Properties**, add `FURIGANA_SERVER_KEY` with your server's password.
5. Save, then reload your sheet.

## Privacy

Your selected text goes to the furigana server to get the readings. It is not stored, logged, or shared, and it is never used to train AI. See [privacy.md](privacy.md) and [terms.md](terms.md).

## License

MIT. See [LICENSE](LICENSE).
