class Container {
  constructor(email) {
    this.SLACK_WEBHOOK_URL = 'slack_webhook_url';
    this.STORY_TEMPLATE = 'story_template';
    this.BUG_TEMPLATE = 'bug_template';
    this.spreadsheet = this.getSpreadsheet();
    this.slackApi = this.getSlackApi(UrlFetchApp.fetch);
    this.generator = this.getDescriptionGenerator(email);
  }
  getSpreadsheet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    return sheet;
  }
  getSlackApi(fetch) {
    const api = new SlackApi(fetch,PropertiesService.getScriptProperties().getProperty(this.SLACK_WEBHOOK_URL));
    return api;
  }
  getDescriptionGenerator(email) {
    const container = this;
    const open_ai = {
      call: (prompt) => {
        container.slackApi.send(`*Ticket Suggestion request for ${email}*:\n\n${prompt}`);
        return "Message sent";
      }
    }
    const story_template = JSON.parse(PropertiesService.getScriptProperties().getProperty(this.STORY_TEMPLATE));
    const bug_template = JSON.parse(PropertiesService.getScriptProperties().getProperty(this.BUG_TEMPLATE));
    const generator = new DescriptionGenerator(open_ai, story_template, bug_template);
    return generator;
  }
}

function test_container() {
  const container = new Container("email@domain.com");
}
