class JiraAPI {
  constructor(baseUrl, username, apiToken) {
    this.baseUrl = baseUrl;
    this.auth = Utilities.base64Encode(`${username}:${apiToken}`);
  }

  // Method to fetch the current sprint for a given project
  fetchCurrentSprint(boardId) {
    const endpoint = `${this.baseUrl}/rest/agile/1.0/board/${boardId}/sprint?state=active`;
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(endpoint, options);

    if (response.getResponseCode() !== 200) {
      throw new Error(`Failed to fetch current sprint. HTTP Status Code: ${response.getResponseCode()}`);
    }

    const data = JSON.parse(response.getContentText());
    const sprints = data.values || [];

    // Return the first active sprint if available
    if (sprints.length === 0) {
      throw new Error("No active sprint found for the specified board.");
    }

    return sprints[0]; // Assuming there's only one active sprint
  }

  // Method to fetch sprint tickets
  fetchSprintTickets(sprintId) {
    const endpoint = `${this.baseUrl}/rest/agile/1.0/sprint/${sprintId}/issue`;
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(endpoint, options);

    if (response.getResponseCode() !== 200) {
      throw new Error(`Failed to fetch sprint tickets. HTTP Status Code: ${response.getResponseCode()}`);
    }

    const data = JSON.parse(response.getContentText());
    const issues = data.issues || [];
    return issues;
  }

  // New method: Fetch issues by JQL query
  fetchIssuesByJQL(jqlQuery) {
    const endpoint = `${this.baseUrl}/rest/api/2/search?jql=${encodeURIComponent(jqlQuery)}`;
    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${this.auth}`,
        'Content-Type': 'application/json'
      },
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(endpoint, options);

    if (response.getResponseCode() !== 200) {
      throw new Error(`Failed to fetch issues by JQL. HTTP Status Code: ${response.getResponseCode()}`);
    }

    const data = JSON.parse(response.getContentText());
    return data.issues || []; // Return the list of issues
  }
}

function jira_api_test() {
  // Access script properties
  const scriptProperties = PropertiesService.getScriptProperties();

  // Retrieve the necessary values
  const baseUrl = scriptProperties.getProperty('JIRA_BASE_URL');
  const username = scriptProperties.getProperty('JIRA_USERNAME');
  const apiToken = scriptProperties.getProperty('JIRA_API_TOKEN');

  // Ensure all properties are set
  if (!baseUrl || !username || !apiToken) {
    Logger.log("Missing one or more Jira API credentials in script properties.");
    return;
  }

  // Create an instance of the JiraAPI class
  const jira = new JiraAPI(baseUrl, username, apiToken);

  // Test the instance (e.g., by fetching the current sprint for a test board ID)
  try {
    const boardId = 317; // Replace with an appropriate test board ID
    const currentSprint = jira.fetchCurrentSprint(boardId);

    Logger.log(`Current Sprint: ${currentSprint.name} (ID: ${currentSprint.id})`);

    const sprintBacklog = jira.fetchSprintTickets(currentSprint.id);
    Logger.log(`Tickets in current sprint: ${sprintBacklog.length}`);

    const issuesByRankQuery = `sprint = ${currentSprint.id} ORDER BY Rank ASC`;
    const issuesByRank = jira.fetchIssuesByJQL(issuesByRankQuery);
    Logger.log(`Tickets in backlog: ${issuesByRank.map(issue => issue.key)}`);
  } catch (error) {
    Logger.log(`Error during Jira API test: ${error.message}`);
  }
}

