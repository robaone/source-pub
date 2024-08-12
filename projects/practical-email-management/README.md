Practical Email Management
==========================

Reference: https://site.robaone.com/blog/practical-email-management

- [Practical Email Management](#practical-email-management)
- [Context](#context)
- [How to guide](#how-to-guide)
  - [Developer Workspace Setup](#developer-workspace-setup)

# Context

This project is intended to be used in Google GMail only and is incompatible with other email services.

# How to guide

The first step in adopting this process in Gmail is to divert all emails from the inbox into a folder called `Other`.

To do this, take the following steps.

1. Open Gmail in the browser
2. Click the advanced search button on the right of the search bar
3. Type `-$YOUR_EMAIL_ADDRESS` in the `from` field (eg. `-bob@email.com`)
4. Press `Create Filter`
5. Select `[ ] Skip the Inbox (Archive it)` and `[ ] Apply the Label:` and choose or create label `Other`
6. Press `Create Filter`

Create a Google Spreadsheet to be used to store your email queries.

1. Go to https://sheets.new
2. Set the name of the Sheet to `Gmail Filters`
3. Bookmark the Sheet or copy and store the url for easy access.


## Developer Workspace Setup

1. Run `npm install` to install the google/clasp node module.
2. Run `npx clasp login` to authenticate with Google.  Choose the account you want to interact with.
3. Store the contents of `~/.clasprc.json` in the Github Secret, `GOOGLE_CLASP_CREDENTIALS`.
4. Create a new script by typing the following command from this folder.  `npx clasp create --type "web app" --title "PracticalEmailManagement" --rootDir src`
5. Move the `.clasp.json` file from the `src` folder to this folder.
6. Push the code with the command, `npx clasp push`.
7. Navigate to the Apps Script project in https://script.google.com 
8. Press the `Deploy` button and the `New deployment` option.
9. Beside `Select type` press the Gear icon and choose `web app`.
10. Set description as `New Deployment`, Execute as `Me` and Who has access as `Only myself`.
11. Press `Deploy`.
12. In the Google Apps Script, select `Project Settings` and `Add script property` to add `spreadsheetId`.  Enter the id from the Spreadsheet url containing the Gmail Filters.

