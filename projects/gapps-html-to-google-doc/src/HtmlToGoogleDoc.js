class HtmlToGoogleDoc {
  constructor(doc) {
    this.doc = doc;
  }

  addHtml(htmlContent) {
    const body = this.doc.getBody();
    const wellFormedHtml = this.ensureWellFormedHtml(htmlContent);
    const html = HtmlService.createHtmlOutput(wellFormedHtml).getContent();
    const parser = XmlService.parse(html);
    const root = parser.getRootElement();
    this.processElement(root, body);
  }

  ensureWellFormedHtml(htmlContent) {
    return `<root>${htmlContent}</root>`;
  }

  processElement(element, parent) {
    const tagName = element.getName().toLowerCase();
    switch (tagName) {
      case 'h1':
        const header1 = parent.appendParagraph(element.getText());
        header1.setHeading(DocumentApp.ParagraphHeading.HEADING1);
        break;
      case 'h2':
        const header2 = parent.appendParagraph(element.getText());
        header2.setHeading(DocumentApp.ParagraphHeading.HEADING2);
        break;
      case 'h3':
        const header3 = parent.appendParagraph(element.getText());
        header3.setHeading(DocumentApp.ParagraphHeading.HEADING3);
        break;
      case 'h4':
        const header4 = parent.appendParagraph(element.getText());
        header4.setHeading(DocumentApp.ParagraphHeading.HEADING4);
        break;
      case 'h5':
        const header5 = parent.appendParagraph(element.getText());
        header5.setHeading(DocumentApp.ParagraphHeading.HEADING5);
        break;
      case 'h6':
        const header6 = parent.appendParagraph(element.getText());
        header6.setHeading(DocumentApp.ParagraphHeading.HEADING6);
        break;
      case 'p':
        const paragraph = parent.appendParagraph(element.getText());
        paragraph.setFontFamily('Arial');
        paragraph.setBackgroundColor(null)
        break;
      case 'ul':
        const ulItems = element.getChildren('li');
        ulItems.forEach(li => {
          const listItem = parent.appendListItem(li.getText());
          listItem.setGlyphType(DocumentApp.GlyphType.BULLET);
          listItem.setFontFamily('Arial');
          listItem.setBackgroundColor(null);
        });
        break;
      case 'ol':
        const listItems = element.getChildren('li');
        listItems.forEach(li => {
          const listItem = parent.appendListItem(li.getText());
          listItem.setGlyphType(DocumentApp.GlyphType.NUMBER);
          listItem.setFontFamily('Arial');
          listItem.setBackgroundColor(null);
        });
        break;
      case 'table':
        const rows = element.getChildren('tr');
        const table = parent.appendTable();
        rows.forEach(row => {
          const cells = row.getChildren('td');
          const tableRow = table.appendTableRow();
          cells.forEach(cell => {
            const tableCell = tableRow.appendTableCell(cell.getText());
            tableCell.setFontFamily('Arial');
            tableCell.setBackgroundColor(null);
          });
        });
        break;
      case 'pre':
        const codeTable = parent.appendTable(); 
        const codeRow = codeTable.appendTableRow(); 
        const codeCell = codeRow.appendTableCell(); 
        codeCell.setBackgroundColor('#f4f4f4'); 
        element.getChildren('code').forEach(codeElement => { 
          const codeBlock = codeCell.appendParagraph(codeElement.getText()); 
          codeBlock.setFontFamily('Courier New'); 
        }); 
        break;
      default:
        element.getChildren().forEach(child => {
          this.processElement(child, parent);
        });
        break;
    }
  }
}
