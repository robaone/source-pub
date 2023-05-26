Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

function archiveEvents() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = sheet.getSheetByName('Log');
  const cutoffIndex = getLastRowBefore(logSheet.getDataRange().getDisplayValues(),(new Date()).addDays(-7));
  if(cutoffIndex > 1) {
    console.log(`Delete ${cutoffIndex} rows`);
    logSheet.deleteRows(2,cutoffIndex-1);
  }
}

function getLastRowBefore(data,cutoffDate) {
for(var i = 1; i < data.length; i++){
    const dateStr = data[i][0];
    const date = new Date(dateStr);
    if(date >= cutoffDate) {
      return i;
    }
  }
  return -1;
}

function test_getLastRowBeforeCutoffDate() {
  const testData = [['Timestamp'],['4/15/2022 7:16:58']];
  const cutoffDate = (new Date()).addDays(-7);
  const index = getLastRowBefore(testData,cutoffDate);
  console.log(`Index = ${index}`);
}
