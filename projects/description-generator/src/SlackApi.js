class SlackApi {
  constructor(postFunction, url) {
    this.post = postFunction;
    this.url = url;
  } 
  send(message) {
    var payload = {
      "text": message
    };
    var payloadJson = JSON.stringify(payload);
    const options = {
      "method": "post",
      "contentType": "application/json",
      "payload": payloadJson
    };
    return this.post(this.url,options);
  }
}

class SlackApiTest {
  before() {
    this.url = undefined;
    this.options = undefined;
    this.post = (url,options) => {
      this.url = url;
      this.options = options;
      return "OK";
    };
  }
  test_testPostMessage() {
    // GIVEN
    const url = 'http://slack.api';
    const api = new SlackApi(this.post, url);
    const message = 'This is a message';
    // WHEN
    const response = api.send(message);
    // THEN
    Assert.match(JSON.stringify({text: 'This is a message'}),this.options.payload);
    Assert.match("OK",response);
  }
}

function test_SlackApi() {
  const object = new SlackApiTest();
  new Test(object).run();
}
