function MessageLogger(sheet) {
  this.sheet = sheet;
  this.log = function(data){
    this.sheet.appendRow(this.toRowData(data));
  }
  this.toRowData = function(data){
    return [
      new Date(),
      data.memberId,
      data.statusMessage
    ];
  }
}

function MessageLoggerTest() {
  this.test_log = function(){
    // GIVEN
    var sheet = {
      'appendRow': function(data){
        Logger.log('appendRow('+data+')');
      }
    };
    var data = {
      'timestamp':new Date(),
      'memberId':'memberId',
      'statusMessage':'Message'
    };
    var logger = new MessageLogger(sheet);
    
    // WHEN
    logger.log(data);
    
    // THEN
  }
}

function test_messagelogger(){
  new Test(new MessageLoggerTest()).run();
}