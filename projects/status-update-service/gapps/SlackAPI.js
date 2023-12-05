function SlackAPI(url,postFunction,access_token,calendar_service) {
  this.url = url;
  this.post = postFunction;
  this.access_token = access_token;
  this.calendar_service = calendar_service;
  this.postMessage = function(message){
    var data = {
      text: message
    };
    var options = {
      contentType: 'application/json; charset=utf-8',
      payload: JSON.stringify(data)
    };
    this.post(options, this.url);
  }
  this.updateStatus = function(status,icon,access_token,event_date) {
    const parent = this;
    const status_date = event_date ?? new Date();
    const trimmed_status = status ? status.length > 86 ? `${status.substring(0,86)}...` : status : '';
    var options = {
      method: 'post',
      contentType: 'application/json; charset=utf-8',
      headers: {
        Authorization: 'Bearer '+access_token,
      },
      payload: JSON.stringify({
        profile:{
          status_text: trimmed_status,
          status_emoji: icon,
          status_expiration: (parent.getEndingDate(status_date).getTime()) / 1000
        }
      })
    };
    if(access_token){
      return this.post(options, 'https://slack.com/api/users.profile.set');
    }
  }
  this.getEndingDate = function(status_date) {
    const currentDate = status_date;
    const end_date = this.calendar_service.getEventEndDate(currentDate);
    return end_date;
  }
}


var POST_PAYLOAD = null;

function SlackAPITest() {
  this.test_postMessage = function(){
    // GIVEN
    var url = 'URL';
    POST_PAYLOAD = null;
    var postFunction = function(options, url){
      Logger.log('post "' + JSON.stringify(options) + '" to ' + url);
      POST_PAYLOAD = options.payload;
    };
    const calendar_service = {
      getEventEndDate: function() {
        return undefined;
      },
      getEndingDate: function() {
        return new Date();
      }
    }
    var slack = new SlackAPI(url,postFunction,undefined,calendar_service);
    
    // WHEN
    slack.postMessage('This is a message');
    
    // THEN
    console.log(POST_PAYLOAD);
  }
  
  this.test_updateStatus = function() {
    // GIVEN
    var url = 'URL';
    POST_PAYLOAD = null;
    var postFunction = function(options, url){
      Logger.log('post "' + JSON.stringify(options) + '" to ' + url);
      POST_PAYLOAD = options;
    }
    const calendar_service = {
      getEventEndDate: function() {
        return new Date();
      },
      getEndingDate: function() {
        return new Date();
      }
    }
    var slack = new SlackAPI(url,postFunction,undefined,calendar_service);

    // WHEN
    slack.updateStatus('This is the status',':smile:','token');

    // THEN
    console.log(POST_PAYLOAD);
  }
}

function test_slackapi(){
  new Test(new SlackAPITest()).run();
};

function test_getEndingDate() {
  const currentDate = new Date();
  const next_event_date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 9);
  const end_date = getEndingDate(next_event_date);
  Logger.log(end_date);
}