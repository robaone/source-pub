function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Sprint Tracking')
    .addItem('Import Jira Tickets', 'importJiraTickets')
    .addToUi();
}

// Function to create Jira data
function createJiraData() {
  // Access script properties to get Jira credentials and base URL
  const scriptProperties = PropertiesService.getScriptProperties();
  const baseUrl = scriptProperties.getProperty('JIRA_BASE_URL');
  const username = scriptProperties.getProperty('JIRA_USERNAME');
  const apiToken = scriptProperties.getProperty('JIRA_API_TOKEN');
  const boardId = scriptProperties.getProperty('BOARD_ID');

  // Ensure all required properties are available
  if (!baseUrl || !username || !apiToken) {
    throw new Error("Missing one or more Jira API credentials in script properties.");
  }

  // Create an instance of the JiraAPI class
  const jira = new JiraAPI(baseUrl, username, apiToken);

  // Define the JQL query to get the tickets for the current sprint
  let sprintId;

  try {
    const currentSprint = jira.fetchCurrentSprint(boardId);
    sprintId = currentSprint.id;
    Logger.log(`Current Sprint: ${currentSprint.name} (ID: ${currentSprint.id})`);
  } catch (error) {
    throw new Error(`Error fetching the current sprint: ${error.message}`);
  }

  // Fetch issues using a JQL query
  const jqlQuery = `sprint = ${sprintId} ORDER BY rank ASC`; // Replace 'rank' with your field ID if needed
  let issues;

  try {
    issues = jira.fetchIssuesByJQL(jqlQuery);
  } catch (error) {
    throw new Error(`Error fetching issues by JQL: ${error.message}`);
  }

  // Create an array to hold the Jira data
  const jiraData = [
    ["Ticket ID", "Summary", "Status", "Assignee", "Due Date", "Story Points", "Balance"] // Header row
  ];

  // Populate the array with issue data
  let runningTotal = 0;
  issues.forEach(issue => {
    const storyPoints = issue.fields.customfield_10004 || 0; // Replace 'customfield_10002' with your Story Points field ID
    runningTotal += storyPoints;

    jiraData.push([
      issue.key,
      issue.fields.summary,
      issue.fields.status.name,
      issue.fields.assignee ? issue.fields.assignee.displayName : "",
      issue.fields.duedate || "",
      storyPoints,
      runningTotal
    ]);
  });

  return jiraData;
}

function formatSprintSheet(sprintSheet, headerLength) {
  // Apply styles to the column headers
  const headerRange = sprintSheet.getRange(1, 1, 1, headerLength);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#4CAF50"); // Green background
  headerRange.setFontColor("white"); // White font for better contrast

  // Adjust the width of the "Summary" column
  const summaryColumnIndex = 2; // "Summary" is in the second column
  sprintSheet.setColumnWidth(summaryColumnIndex, 300); // Set width as needed

  // Apply subdued styling for rows with "Status" = "Done"
  const lastRow = sprintSheet.getLastRow();
  const statusColumnIndex = 3; // "Status" is in the third column

  if (lastRow > 1) { // Check if there are any rows beyond the header
    const statusRange = sprintSheet.getRange(2, statusColumnIndex, lastRow - 1, 1); // Status column, excluding the header
    const statuses = statusRange.getValues();

    for (let i = 0; i < statuses.length; i++) {
      if (statuses[i][0] === "Done") {
        const row = i + 2; // Row index starts from 2 (accounting for header row)
        const rowRange = sprintSheet.getRange(row, 1, 1, headerLength);
        rowRange.setFontColor("#808080"); // Gray font for subdued effect
        rowRange.setBackground("#F0F0F0"); // Light gray background
      }
    }
  }
}


function importJiraTickets() {
  // Get the active spreadsheet
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // Find the sheet named "Sprint" or create it if it doesn't exist
  let sprintSheet = spreadsheet.getSheetByName("Sprint");
  if (!sprintSheet) {
    sprintSheet = spreadsheet.insertSheet("Sprint");
  }

  // Clear the contents of the "Sprint" sheet
  sprintSheet.clear();

  // Add new content (placeholder for Jira ticket data)
  const jiraData = createJiraData();

  sprintSheet.getRange(1, 1, jiraData.length, jiraData[0].length).setValues(jiraData);

  // Format the Sprint sheet
  formatSprintSheet(sprintSheet, jiraData[0].length);
}

