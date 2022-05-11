Practical Email Management
==========================

Reference: https://site.robaone.com/blog/practical-email-management

- [Practical Email Management](#practical-email-management)
- [Context](#context)
  - [Developer Workspace Setup](#developer-workspace-setup)
  - [Deployment workflow](#deployment-workflow)
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
8. Navigate to the Apps Script project in https://script.google.com 
9. Press the `Deploy` button and the `New deployment` option.
10. Beside `Select type` press the Gear icon and choose `web app`.
11. Set description as `DEV`, Execute as `Me` and Who has access as `Only myself`.
12. Press `Deploy`.
13. Copy the deployment id and store it on the GitHub secret, `PRACTICAL_EMAIL_MANAGEMENT_DEPLOYMENT_ID_DEV`.
14. Copy the `.clasp.json` file to `.clasp.dev.json`
15. Create a new script by typing the following command from this folder.  `npx clasp create --type "web app" --title "PracticalEmailManagement-PROD" --rootDir src`
16. Move the file `src/.clasp.json` to `.clasp.prod.json`.
17. Copy the `scriptId` from the `.clasp.prod.json` file and store it on the GitHub Secret, `PRACTICAL_EMAIL_MANAGEMENT_PROD_ID`.

## Deployment workflow

- A feature branch will push code to the DEV project
- Merging to develop will publish code to the DEV project
- A release branch will push code to the PROD project
- Merging to the main branch will publish code to the PROD project

## Unit Testing

This project uses Jest for unit testing

