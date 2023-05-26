class OpenAI {
  constructor(fetch, api_key) {
    this.fetch = fetch;
    this.api_key = api_key;
    this.properties = {
      'temperature': 0.7,
      'max_tokens': 1000,
      'top_p': 1.0,
      'frequency_penalty': 0.0,
      'presence_penalty': 0.0
    }
    this.url = 'https://api.openai.com/v1/chat/completions';
  }

  sendRequest(model, prompt) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.api_key}`
    };

    const payload = {
      model,
      'messages': [
        {
          'role': 'user',
          'content': prompt
        }
      ],
      ...this.properties
    };

    const options = {
      'method': 'post',
      'headers': headers,
      'payload': JSON.stringify(payload)
    };

    const response = this.fetch(this.url, options);
    const result = response.getContentText();
    return JSON.parse(result);
  }
}

function test_openAI() {
  // GIVEN
  const result = '{"message":"This is the result"}';
  const fetch = (url,options) => {
    Logger.log(url);
    Logger.log(JSON.stringify(options));
    return {
      getContentText: () => result
    };
  };
  const open_ai_service = new OpenAI(fetch,'key');

  // WHEN
  const response = open_ai_service.sendRequest('gpt-3.5-turbo','This is a test');

  // THEN
  Logger.log(response);
}

function test_openAICall() {
  const key = PropertiesService.getScriptProperties().getProperty('open_ai_key');
  const model = 'gpt-3.5-turbo';
  const prompt = 'This is a test';
  const open_ai_service = new OpenAI(UrlFetchApp.fetch,key);
  
  const response = open_ai_service.sendRequest(model,prompt);

  Logger.log(JSON.stringify(response));
}
