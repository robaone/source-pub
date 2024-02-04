function onFormSubmit(event) {
  const container = new Container();
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
  const event = {
    "authMode": "FULL",
    "namedValues": {
      "Timestamp": [
        "2/4/2024 8:08:19"
      ],
      "Enter your description details": [
        "This is a test"
      ],
      "What type of ticket is this": [
        "Story"
      ]
    },
    "range": {
      "columnEnd": 1,
      "columnStart": 1,
      "rowEnd": 1,
      "rowStart": 1
    },
    "source": {},
    "triggerUid": "24782037",
    "values": [
      "2/4/2024 8:08:19",
      "Story",
      "This is a test"
    ]
  };
  onFormSubmit(event);
}