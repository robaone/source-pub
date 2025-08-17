# gapps-html-to-google-doc

The `HtmlToGoogleDoc` class is designed to convert HTML content into a Google Doc format. This class ensures that the HTML content is well-formed and processes various HTML elements to create corresponding elements in a Google Doc.

## Features

- Converts HTML headings (`<h1>` to `<h6>`) to Google Doc headings.
- Converts paragraphs (`<p>`) to Google Doc paragraphs.
- Converts unordered lists (`<ul>`) and ordered lists (`<ol>`) to Google Doc lists.
- Converts tables (`<table>`) to Google Doc tables.
- Converts preformatted text (`<pre>`) to Google Doc code blocks.

## Usage

### Constructor

```javascript
const doc = DocumentApp.create('New Document');
const htmlToGoogleDoc = new HtmlToGoogleDoc(doc);

### Methods

`addHtml(htmlContent)`

Adds HTML content to the Google Doc.

```javascript
htmlToGoogleDoc.addHtml('<h1>Title</h1><p>This is a paragraph.</p>');
```

### Example

```javascript
const doc = DocumentApp.create('New Document');
const htmlToGoogleDoc = new HtmlToGoogleDoc(doc);
htmlToGoogleDoc.addHtml('<h1>Title</h1><p>This is a paragraph.</p>');
```
