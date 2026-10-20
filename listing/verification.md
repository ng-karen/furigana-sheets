# OAuth verification text

Paste these into the Verification Center form for project 262222190462.

## App home page
https://www.fivepluszero.com/furigana

## Why each permission is needed

**spreadsheets.currentonly**
Reads the text in the cells the user selects and writes the furigana readings back into those same cells. It only works on the spreadsheet the add-on is open in. It never sees other files.

**script.container.ui**
Shows the Furigana menu under Extensions, the prompt where the user pastes their own Gemini API key, and short messages such as "Your key is saved."

**script.external_request**
Sends the selected cell text to the Gemini API (generativelanguage.googleapis.com) with the user's own API key, and gets back the hiragana readings. This is the only outside request the add-on makes. It has no server of its own.

## Demo video (YouTube, unlisted is fine)

Record about 1 to 2 minutes. Show the browser address bar at least once so the reviewer can see the OAuth client ID on the permission screen.

1. Open a blank Google Sheet and start the add-on (test deployment or install).
2. Click Extensions > Furigana > Add furigana to selection. Show the permission screen with the app name and all 3 permissions. Click Allow.
3. Click Extensions > Furigana > Set Gemini API key. Paste a key and click OK. (Shows script.container.ui.)
4. Type 東京は日本の首都です。 in A1, select it, click Add furigana to selection. Gray readings appear. (Shows spreadsheets.currentonly and script.external_request.)
5. Click Remove furigana from selection. The readings go away.

Upload to YouTube as Unlisted and paste the link into the form.
