# gapps-unit-test-library

The shared library is upblished under the following Script ID

```
1oMGC6V0-lmEGuNbG-aBSSDmAaToq2VLKQ5T_tvQ_Qs8tFq-P4ojSXAO-
```

## Setup

To import this library

1. Copy the ID above
1. Open or Create a Google Apps Script Project
1. Press the `+` beside **Library** on the left
1. Paste the Script ID in the text box
1. Press the **Look up** button
1. Choose the version you want to use.  Select `HEAD` to use the latest development version
1. Enter your preferred Identifier or leave it as is.

## Usage

To use the testing library follow the example below.

Note: The library has been imported with the prefix, `UnitTest`.

### Example Class that you want to test

```javascript
class ZapierWebhook {
  constructor(
    fetch,
    url
  ) {
    this.fetch = fetch;
    this.url = url;
  }
  send(payload) {
    const options = {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    }
    const response = this.fetch(this.url, options);
    return response;
  }
}
```

### Unit Test Using Library

```javascript
class ZapierWebhookTest {
  before() {
    this.expected = {};
    this.calls = {
      fetch: []
    };
    this.fetch = (url, options) => {
      this.calls.fetch.push({url, options});
      return this.expected;
    }
    this.webhook = new ZapierWebhook(this.fetch,'https://myurl.com');
  }
  test_send() {
    const payload = { greeting: 'Hello World!'};
    this.expected = 'expected response';
    const response = this.webhook.send(payload);
    UnitTest.Assert.match(this.expected,response);
    UnitTest.Assert.deepEquals(payload, JSON.parse(this.calls.fetch[0].options.payload));
  }
}
```

### Function that will execute the tests

```javascript
function test_ZapierWebhook() {
  const object = new ZapierWebhookTest();
  new UnitTest.Test(object).run();
}
```

### Instructions on running the tests

1. In the script menu, run the test function, `test_ZapierWebhook`.
1. It will run all of the test class functions starting with `test_`.
1. You can also debug by creating a breakpoint and choosing **Debug** instead of **Run**.

The test will run the before function before each `test_` function.  It will run `test_send()` and check to see if it returns the expected response and if it has the expected side effect of calling the fetch method with the expected payload.