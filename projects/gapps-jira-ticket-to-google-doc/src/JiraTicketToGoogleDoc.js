class JiraTicketToGoogleDoc {
  constructor(jiraClient) {
    this.jiraClient = jiraClient;
  }
  import(jira_ticket, doc) {
    if(!jira_ticket) {
      throw new Error('You must provide a jira ticket id');
    }
    if(!doc) {
      throw new Error('You must provide a document object');
    }
    const ticket_data = this.jiraClient.getTicket(jira_ticket);
    this._convert(ticket_data, doc);
  }
  _convert(ticket_data, doc) {
    const key = ticket_data.key;
    const issueType = ticket_data.fields.issuetype.name;
    const title = ticket_data.fields.summary;
    const creator = ticket_data.fields.creator.displayName;
    const assignee = ticket_data.fields.assignee.displayName;
    const status = ticket_data.fields.status.name;
    const description = ticket_data.fields.description;
    const impactSummary = ticket_data.fields.customfield_11625;
    const updated = ticket_data.fields.updated;
    const parent = ticket_data.fields.customfield_10008;
    const expectedResult = ticket_data.fields.customfield_11393;
    const comments = ticket_data.fields.comment.comments.map((comment) => {
      return {
        created: comment.created,
        updated: comment.updated,
        author: comment.author.displayName,
        body: comment.body
      }
    });
    
    const renameDocFile = (key, title) => DriveApp.getFileById(doc.getId()).setName(`${key} - ${title}`);
    const addTitleToDoc = (title) => {
      var body = doc.getBody();
      body.insertParagraph(0, title).setHeading(DocumentApp.ParagraphHeading.HEADING1);
    };
    const addSubTitle = (key, assignee, updated) => {
      var body = doc.getBody();
      body.insertParagraph(1,`${key}: Assigned to ${assignee} - updated ${updated}`).setHeading(DocumentApp.ParagraphHeading.HEADING3);
    }
    const addDescription = (description) => {
      var body = doc.getBody();
      body.insertParagraph(2,'Description').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.insertParagraph(3,description);
    }
    const addExpectedResults = (expected) => {
      var body = doc.getBody();
      body.appendParagraph('Expected Results').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph(expected);
    }
    const addImpactSummary = (impact) => {
      var body = doc.getBody();
      body.appendParagraph('Impact Summary').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph(impact);
    }
    const addComments = (comments) => {
      var body = doc.getBody();
      body.appendParagraph('Comments').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      comments.forEach((comment) => {
        body.appendParagraph(`${comment.created}: ${comment.author}`).setHeading(DocumentApp.ParagraphHeading.HEADING3);
        body.appendParagraph(comment.body)
      })
    }

    renameDocFile(key, title);
    addTitleToDoc(title);
    addSubTitle(key, assignee, updated);
    addDescription(description);
    if(issueType === 'Bug') {
      //addStepsToReproduce();
      addExpectedResults(expectedResult);
      //addActualResults(actualResult);
    }
    if(impactSummary) {
      addImpactSummary(impactSummary);
    }
    if(comments) {
      addComments(comments);
    }
  }
}

class JiraTicketToGoogleDocTest {
  before() {
    const credentials = {
      username: PropertiesService.getScriptProperties().getProperty('jira_username'),
      token: PropertiesService.getScriptProperties().getProperty('jira_token'),
    };
    const jira_url = `https://${PropertiesService.getScriptProperties().getProperty('jira_domain')}`;
    this.jiraApi = new JiraAPI(UrlFetchApp.fetch, credentials, jira_url);
    this.doc = DocumentApp.create('JiraTicketToGoogleDoc_Test');
    this.docId = this.doc.getId();
    this.jira_ticket = {};
    this.service = new JiraTicketToGoogleDoc(this.jiraApi);
  }
  after() {
    var file = DriveApp.getFileById(this.docId);
    file.setTrashed(true);
  }
  xtest_createGoogleDoc() {
    Assert.isTrue(this.docId != undefined);
  }
  test_importJiraTicket() {
    const ticketId = 'CORE-1868';
    this.service.import(ticketId, this.doc);
  }
}

function test_JiraTicketToGoogleDoc() {
    const object = new JiraTicketToGoogleDocTest();
    new Test(object).run();
}