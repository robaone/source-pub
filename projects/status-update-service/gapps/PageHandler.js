function PageHandler(spreadsheet,oauth){
  this.spreadsheet = spreadsheet;
  this.oauth = oauth;
  this.handle = function(request){
    Logger.log('PageHandler.handle(request)');
    Logger.log(request);
    const data = {
      "version":"1.1.0",
      "request":request,
      "code":request.parameter.code
    };
    if(data.code !== undefined){
      data.oauth_result = this.authorize(data.code);
    }
    return data;
  }

  this.saveAuthorization = function(data) {
    const authorizations_sheet = this.spreadsheet.getSheetByName('Authorizations');
    authorizations_sheet.appendRow([JSON.parse(data).authed_user.id,data]);
  }
  
  this.authorize = function(code) {
    const response = this.oauth.authorize(code);
    if(JSON.parse(response).ok === true){
      this.saveAuthorization(response);
    }
    return response;
  }
}

class OAuth {
  constructor(client_id,client_secret,url,post_function) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    this.url = url;
    this.post_function = post_function;
  }
  
  authorize(code) {
    const response = this.post_function(
      {
        payload: {
          code: code,
          client_id: this.client_id,
          client_secret: this.client_secret
        }
      },
      this.url
    );
    return response;
  }
}

function PageHandlerTest(){
  this.test_handle = function(){
    // GIVEN
    var sheet = {
      appendRow: function(dataArray) {
        console.log(`appendRow(${dataArray})`);
      }
    };
    var spreadsheet = {
      getSheetByName: function(name){
        return {
          insertSheet: function(name) {
            return sheet;
          }
        };
      }
    };
    var request = {
      
    };
    var oauth = {
      authorize: function(code) { 
        return {
          ok: true
        }
      }
    };
    var handler = new PageHandler(spreadsheet,oauth);
    
    // WHEN
    handler.handle(request);
    
    // THEN
  }
}

function test_pagehandler(){
  new Test(new PageHandlerTest()).run();
}