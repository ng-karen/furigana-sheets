# OAuth scope verification

Project 262222190462. Two scopes need verification: script.container.ui and script.external_request.

## Step 1: Data Access page

Google Auth Platform > Data Access > Add or remove scopes. Under "Manually add scopes", paste:

```
https://www.googleapis.com/auth/spreadsheets.currentonly
https://www.googleapis.com/auth/script.container.ui
https://www.googleapis.com/auth/script.external_request
```

Click Add to table, Update, then Save. These must match appsscript.json and the Marketplace SDK App Configuration exactly.

## Step 2: How will the scopes be used?

Paste this into the justification box for the sensitive scopes:

Furigana for Google Sheets™ adds hiragana readings (furigana) to Japanese text in the cells a user selects.

script.container.ui: Shows the add-on menu under Extensions > Furigana and short alert messages, such as error messages and the daily limit notice. The add-on has no sidebar and shows no outside web content.

script.external_request: Sends the text of the selected cells over HTTPS to the add-on's own furigana server on Google Cloud Run (furigana-server-262222190462.us-west1.run.app), and receives the hiragana readings back. The server uses a Japanese dictionary (kuromoji), not AI. It processes the text in memory and does not store or log it. This is the only outside request the add-on makes. No third party receives user data.

spreadsheets.currentonly (non-sensitive): Reads the selected cells and writes the readings back into those same cells, in the current spreadsheet only.

## Step 3: Demo video

https://youtu.be/a_UeWyHuSKs

It shows the permission screen with all 3 permissions, the Furigana menu (script.container.ui), and the readings coming back (script.external_request). Recorded with script version 2 (dictionary server, no Gemini).

## Step 4: Submit

Verification Center > Submit for verification. After Google approves the scopes, resubmit the Marketplace Store Listing.

## App home page
https://www.fivepluszero.com/furigana
