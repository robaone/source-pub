class PageRenderer {
  constructor(client_id,redirect_uri) {
    this.client_id = client_id;
    this.redirect_uri = redirect_uri;
  }
  render(data) {
    data['client_id'] = this.client_id;
    data['redirect_uri'] = this.redirect_uri;
    const template = HtmlService.createTemplateFromFile('index');
    template.data = data;
    template.client_id = 'test';
    return template.evaluate();
  }
}