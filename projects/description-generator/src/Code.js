function onFormSubmit(event) {
  const email = event.values[3];
  const container = new Container(email);
  var log_sheet = container.spreadsheet.getSheetByName("Logs");
  if(log_sheet == undefined){
    log_sheet = container.spreadsheet.insertSheet("Logs");
    log_sheet.appendRow(["timestamp","event"]);
  }
  Logger.log(JSON.stringify(event));
  log_sheet.appendRow([new Date(),JSON.stringify(event)]);
  Logger.log(container.spreadsheet.getName());
  const type = event.values[1];
  const description = event.values[2];
  container.generator.generate(description,type);
}

function test_formSubmit() {
  const event = {"authMode":"FULL","namedValues":{"Enter your description details":["I need to collect email addresses for the ticket suggestion form.  It is not collecting them at this time."],"What type of ticket is this":["Bug"],"Timestamp":["2/4/2024 8:23:30"],"Email Address":["user@domain.com"]},"range":{"columnEnd":4,"columnStart":1,"rowEnd":7,"rowStart":7},"source":{},"triggerUid":"24782037","values":["2/4/2024 8:23:30","Bug","I need to collect email addresses for the ticket suggestion form.  It is not collecting them at this time.","user@domain.com"]};
  onFormSubmit(event);
}