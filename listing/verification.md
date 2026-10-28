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

script.container.ui: Shows the add-on menu under Extensions > Furigana, the prompt where the user pastes their own Gemini API key, and short alert messages such as "Your key is saved." and error messages. The add-on has no sidebar and shows no outside web content.

script.external_request: Sends the text of the selected cells to the Gemini API (generativelanguage.googleapis.com) using the user's own API key, and receives the hiragana readings back. This is the only outside request the add-on makes. The add-on has no server of its own and stores no user data.

spreadsheets.currentonly (non-sensitive): Reads the selected cells and writes the readings back into those same cells, in the current spreadsheet only.

## Step 3: Demo video

https://youtu.be/6jCqP7IBWLA

It shows the permission screen with all 3 permissions, the Furigana menu and API key prompt (script.container.ui), and the readings coming back from Gemini (script.external_request).

## Step 4: Submit

Verification Center > Submit for verification. After Google approves the scopes, resubmit the Marketplace Store Listing.

## App home page
https://www.fivepluszero.com/furigana
