const MailRecovery = require("./MailRecovery");

// start-app-script
function configure() {
  const emailService = {
    search:(query) =>{
      var age = new Date();  
      age.setDate(age.getDate() - 90);   
      var purge  = Utilities.formatDate(age, Session.getTimeZone(), "yyyy-MM-dd");
      const result = GmailApp.search(`-label:Inbox label:unread before:${purge} ${query}`,0,40);
      return result;
    },
    move:(email) =>{
      email.moveToInbox();
      return {subject:email.getMessages()[0].getSubject(),from:email.getMessages()[0].getFrom()};
    }
  };
  const queryService = {
    getQueries: () => {
      const sheet = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('spreadsheetId')).getSheetByName('Queries');
      const queryData = sheet.getDataRange().getValues();
      queryData.shift();
      const queries = queryData.map(d => d[0]).flat();
      return queries;
    }
  };
  const recoveryService = new MailRecovery(emailService,queryService);
  return {
    recoveryService,
    emailService,
    queryService
  };
}
// end-app-script