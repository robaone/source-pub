function SlackPublisher(sheet,slackAPI,logFunction,date) {
  this.sheet = sheet;
  this.slack = slackAPI;
  this.log = logFunction;
  this.date = date;
  this.publish = function(data) {
    Logger.log('SlackPublisher.publish('+JSON.stringify(data)+')');
    var statusMessage = data.statusMessage;
    //if(!this.hasMessage(statusMessage,this.date)){
      const response = this.post(statusMessage,data.access_token,data.emoji,date);
      Logger.log(response);
    //}
  }
  this.hasMessage = function(message,date) {
    var range = this.sheet.getDataRange();
    var values = range.getValues();
    for (var i = values.length-1; i > 0;i--){
      var storedMessage = values[i][2];
      var logDate = new Date(values[i][0]);
      if(this.isSameDay(logDate,this.date) && storedMessage == message){
        return true;
      }
    }
    return false;
  }
  this.isSameDay = function(date1,date2){
    var dates = [date1,date2];
    var days = dates.map(d => new Date(d.getYear(),d.getMonth(),d.getDay()));
    return days[0].getTime() == days[1].getTime();
  }
  this.post = function(message,access_token,emoji,date){
    //this.slack.postMessage(message);
    return this.slack.updateStatus(message,emoji,access_token,date);
  }
}

function SlackPublisherTest() {
  this.test_do_not_publish_if_same = function(){
    // GIVEN
    var log = function(message){};
    var sheet = {
      'getLastRow': function(){
        return 1;
      },
      'getDataRange': function(){
        return {
          'getCell':function(row,col){
            return {
              'getValues': function(){
                return [['Message']];
              }
            }
          },
          'getValues':function(){
            return [
              ['Timestamp','MemberID','Message'],
              ['1/11/2021 14:09:41','memberId','Message']
            ];
          }
        }
      }
    };
    var slackAPI = {
      'postMessage': function(message){
        Logger.log('Slack.postMessage('+message+')');
      },
      'updateStatus': function(message,icon,access_token){
        Logger.log('Slack.updateStatus('+message+','+icon+','+access_token+')')
      }
    };
    var publisher = new SlackPublisher(sheet,slackAPI,log,new Date('1/11/2021'));
    var data = {
      'statusMessage':'Message',
      'access_token':'token',
    };
    
    // WHEN
    publisher.publish(data);
    
    // THEN
    
  }
  this.test_publish_if_different = function(){
    // GIVEN
    var log = function(message){};
    var sheet = {
      'getLastRow': function(){
        return 1;
      },
      'getDataRange': function(){
        return {
          'getCell':function(row,col){
            return {
              'getValues': function(){
                return [['Message']];
              }
            }
          },
          'getValues':function(){
            return [
              ['Timestamp','MemberID','Message'],
              ['1/11/2021 14:09:41','memberId','Message']
            ];
          }
        }
      }
    };
    var slackAPI = {
      'postMessage': function(message){
        Logger.log('Slack.postMessage('+message+')');
      },
      'updateStatus': function(message,icon,access_token){
        Logger.log('Slack.updateStatus('+message+','+icon+','+access_token+')')
      }
    };
    var publisher = new SlackPublisher(sheet,slackAPI,log,new Date('1/11/2021'));
    var data = {
      'statusMessage':'Working on a job',
      'access_token':'token'
    };
    
    // WHEN
    publisher.publish(data);
    
    // THEN
    
  }
}

function test_slackpublisher() {
  new Test(new SlackPublisherTest()).run();
}