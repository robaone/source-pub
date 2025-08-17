// HTTP FUNCTIONS
function doPost(request,optionalContainer) {
  Logger.log("POST");
  var container = optionalContainer == undefined ? loadConfig() : optionalContainer;
  var dataHandler = container.get('post_handler');
  var data = dataHandler.handle(request);
  if ( container.get('data_filter')) {
    var dataFilter = container.get('data_filter');
    data = dataFilter(data);
  }
  if(data){
    var postHandleListeners = container.get('post_handle_listeners');
    postHandleListeners.forEach(h => h(data));
  }
  return ContentService.createTextOutput(JSON.stringify(request) ).setMimeType(ContentService.MimeType.JSON);
}

function doGet(request,optionalContainer) {
  Logger.log("GET");
  Logger.log(request);
  var container = optionalContainer == undefined ? loadConfig() : optionalContainer;
  var pageHandler = container.get('get_handler');
  const response = pageHandler.handle(request);
  return container.get('page_renderer').render(response);
}

function test_doPost() {
  const response = doPost({
    postData:{
      contents: PropertiesService.getScriptProperties().getProperty('sample_post')
    }
  });
}

function test_doGet() {
  const response = doGet(JSON.parse(PropertiesService.getScriptProperties().getProperty('sample_request')));
}

function set_properties() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var sheet = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('sheet_id'));
  var sample_request = sheet.getRange('C2').getValue();
  scriptProperties.setProperty('sample_post',sample_request);
  Logger.log(scriptProperties.getProperty('sample_post'));
}

function importJiraComments() {
  const container = loadConfig();
  container.get(COMMENT_IMPORTER).run();
}