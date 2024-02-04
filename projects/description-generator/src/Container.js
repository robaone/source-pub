class Container {
  constructor() {
    this.SLACK_WEBHOOK_URL = 'slack_webhook_url';
    this.spreadsheet = this.getSpreadsheet();
    this.slackApi = this.getSlackApi(UrlFetchApp.fetch);
  }
  getSpreadsheet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    return sheet;
  }
  getSlackApi(fetch) {
    const api = new SlackApi(fetch,PropertiesService.getScriptProperties().getProperty(this.SLACK_WEBHOOK_URL));
    return api;
  }
}

function test_container() {
  const container = new Container();
}
