Practical Email Management
==========================

Reference: https://site.robaone.com/blog/practical-email-management

- [Practical Email Management](#practical-email-management)
- [Context](#context)
  - [Developer Workspace Setup](#developer-workspace-setup)
# Context

This project is intended to be used in Google GMail only and is incompatible with other email services.

## Developer Workspace Setup

1. Run `npm install` to install the google/clasp node module.
2. Run `npx clasp login` to authenticate with Google.  Choose the account you want to interact with.
3. Store the contents of `~/.clasprc.json` in the Github Secret, `GOOGLE_CLASP_CREDENTIALS`.
4. Create a new script by typing the following command from this folder.  `npx clasp create --type "web app" --title "PracticalEmailManagement-DEV" --rootDir src`
5. Move the `.clasp.json` file from the `src` folder to this folder.
6. Push the code with the command, `npx clasp push`.
7. Copy the `scriptId` from the `.clasp.json` file and store it on the GitHub Secret, `PRACTICAL_EMAIL_MANAGEMENT_DEV_ID`
