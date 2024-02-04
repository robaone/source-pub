class Container {
  constructor() {
    this.spreadsheet = this.getSpreadsheet();
  }
  getSpreadsheet() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    return sheet;
  }
}
