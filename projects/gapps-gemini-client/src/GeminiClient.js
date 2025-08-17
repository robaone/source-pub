class GeminiClient {
  /**
   * @param {string} apiKey
   * @param {object} [opts]
   * @param {string} [opts.model] e.g. "gemini-1.5-flash" or "gemini-1.5-pro"
   * @param {number} [opts.timeoutMs]
   * @param {array}  [opts.history] e.g. [{ role, parts: [{text}]}]
   * @param {string} [opts.systemInstruction]
   * @param {Function} fetch
   */
  constructor(apiKey, opts = {}, fetch = UrlFetchApp.fetch) {
    if (!apiKey) throw new Error('Missing API key. Set Script Property "gemini.key".');
    this.apiKey = apiKey;
    this.model = opts.model || 'gemini-1.5-flash';
    this.timeoutMs = opts.timeoutMs || 60000;
    this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
    this.history = Array.isArray(opts.history) ? opts.history.slice() : [];
    if (opts.systemInstruction) this.setSystemInstruction(opts.systemInstruction);
    this.fetch = fetch;
  }

  /**
   * Send the current conversation and get model reply.
   * It appends the model reply back into history.
   * @param {object} [generationConfig]
   * @returns {string} model text
   */
  send(generationConfig = {}) {
    if (this.history.length === 0) {
      throw new Error('send: history is empty; call addTurn("user", text) first');
    }
    const payload = {
      ...(this.systemInstruction ? { system_instruction: this.systemInstruction } : {}),
      contents: this.history,
      generationConfig
    };
    const resp = this._post(payload);
    const text = GeminiClient._extractText(resp);
    // store assistant turn
    this.addTurn('model', text);
    return text;
  }

  sendJSON(schema = undefined, config = {}) {
    if (this.history.length === 0) {
      throw new Error('sendJSON: history is empty; call addTurn("user", text) first');
    }
    const generationConfig = {
      response_mime_type: 'application/json',
      ...(schema ? { response_schema: schema } : {}),
      ...config,
    };
    const payload = {
      ...(this.systemInstruction ? { system_instruction: this.systemInstruction } : {}),
      contents: this.history,
      generationConfig
    };
    const resp = this._post(payload);
    const text = GeminiClient._extractText(resp);
    // Validate JSON
    JSON.parse(text);
    this.addTurn('model', text);
    return text;
  }

  setModel(model) {
    if (!model || typeof model !== 'string') throw new Error('setModel: model must be a string');
    this.model = model;
    this.baseUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
    return this;
  }

  /**
   * Ensure history stays under approx character budget (rough proxy for tokens).
   * Keeps most recent turns; prefers not to drop the first user turn if tiny.
   * @param {number} maxChars default ~12k chars (tune to your model/context)
   */
  ensureCharBudget(maxChars = 12000) {
    const total = this.history.reduce((n,t)=> n + JSON.stringify(t).length, 0);
    if (total <= maxChars) return this;
    // keep tail until under budget
    let i = this.history.length - 1;
    const kept = [];
    let used = 0;
    while (i >= 0 && used < maxChars) {
      const turn = this.history[i];
      const cost = JSON.stringify(turn).length;
      if (used + cost > maxChars) break;
      kept.unshift(turn);
      used += cost;
      i--;
    }
    this.history = kept.length ? kept : this.history.slice(-1); // never empty the whole convo
    return this;
  }

  /**
   * Call Gemini for plain text.
   * @param {string} prompt
   * @param {object} [generationConfig]
   * @returns {string} text
   */
  generateText(prompt, generationConfig = {}) {
    const payload = {
      contents: [{ parts: [{ text: prompt }]}],
      generationConfig
    };
    const resp = this._post(payload);
    return GeminiClient._extractText(resp);
  }

  /**
   * Call Gemini and force JSON output, optionally with a JSON Schema.
   * @param {string} prompt
   * @param {object} [schema] JSON Schema object if yuh want validation/shape
   * @param {object} [config] extra generation config (e.g. temperature)
   * @returns {string} raw JSON string (already valid JSON text)
   */
  generateJSON(prompt, schema = undefined, config = {}) {
    const generationConfig = {
      response_mime_type: 'application/json',
      ...(schema ? { response_schema: schema } : {}),
      ...config,
    };

    const payload = {
      contents: [{ parts: [{ text: prompt }]}],
      generationConfig
    };

    const resp = this._post(payload);
    const text = GeminiClient._extractText(resp);

    // Ensure it’s valid JSON text
    try {
      JSON.parse(text);
    } catch (e) {
      throw new Error('Gemini did not return valid JSON. Received:\n' + text);
    }
    return text;
  }

  /**
   * Set a stable system instruction (optional).
   * @param {string} text
   */
  setSystemInstruction(text) {
    this.systemInstruction = { parts: [{ text }]};
    return this;
  }

  /**
   * Add a user/model turn to the local history.
   * @param {"user"|"model"} role
   * @param {string} text
   */
  addTurn(role, text) {
    if (role !== 'user' && role !== 'model') {
      throw new Error('addTurn: role must be "user" or "model"');
    }
    this.history.push({ role, parts: [{text}]});
    return this;
  }

  /**
   * Trim history to avoid token blowups. Keep last N parts.
   * @param {number} maxParts
   */
  truncateHistory(maxParts = 20) {
    maxParts = Math.max(0, Math.floor(maxParts));
    if (this.history.length > maxParts) {
      this.history = maxParts === 0 ? [] : this.history.slice(-maxParts);
    }
  }

  /**
   * Clear history completely
   */
  clearHistory() {
    this.history = [];
    return this;
  }

  /**
   * Internal: POST helper with retries.
   * @param {object} payload
   * @returns {object} parsed JSON response
   */
  _post(payload) {
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    let lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = this.fetch(this.baseUrl, options);
        const code = res.getResponseCode();
        const body = res.getContentText();
        if (code >= 200 && code < 300) {
          return JSON.parse(body);
        }
        lastErr = new Error(`Gemini API error (HTTP ${code}): ${body}`);
      } catch (e) {
        lastErr = e;
      }
      Utilities.sleep(200 * attempt + Math.floor(Math.random() * 100)); // backoff
    }
    throw lastErr || new Error('Unknown Gemini API error.');
  }

  /**
   * Pull first candidate text safely.
   * @param {object} resp
   * @returns {string}
   */
  static _extractText(resp) {
    // Typical shape: { candidates: [ { content: { parts: [ { text: "..." } ] } } ] }
    const text =
      resp &&
      resp.candidates &&
      resp.candidates[0] &&
      resp.candidates[0].content &&
      resp.candidates[0].content.parts &&
      resp.candidates[0].content.parts[0] &&
      (resp.candidates[0].content.parts[0].text || resp.candidates[0].content.parts[0].inlineData?.data);

    if (!text || typeof text !== 'string') {
      throw new Error('Could not extract text from Gemini response: ' + JSON.stringify(resp));
    }
    return text.trim();
  }
}

class GeminiClientTest {
    before() {
        // This happens before every test
        // Retrieve the api key
        this.apiKey = PropertiesService.getScriptProperties().getProperty('gemini.key');
        this.client = new GeminiClient(this.apiKey);
    }
    after() {
        // This happens after every test
        this.apiKey = undefined;
    }
    test_geminiKey() {
        Assert.isTrue(this.apiKey !== undefined && this.apiKey !== null && this.apiKey !== '');
    }
    test_geminiPrompt() {
        // GIVEN
        const prompt = 'Write a 2-sentence fun fact about Belize. Keep it under 60 words.';
        // WHEN
        const response = this.client.generateText(prompt, { temperature: 0.7 });
        // THEN
        Assert.isTrue(response !== undefined && response.length > 10);
        Logger.log('Plain text response:\n' + response);
    }
    test_geminiStructuredResponse() {
        // GIVEN
        const schema = {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              district: { type: 'string' },
              attraction: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } }
            },
            required: ['district', 'attraction']
          }
        };
        const prompt = 'Return 3 Belize travel attractions as JSON array of {district, attraction, tags}. No extra text.';
        // WHEN
        const response = this.client.generateJSON(prompt, schema, { temperature: 0.2 });
        // THEN
        const parsed = JSON.parse(response);
        Assert.isTrue(Array.isArray(parsed) && parsed.length > 0, 'Expected a non-empty JSON array.');
        Logger.log('Structured JSON response:\n' + JSON.stringify(parsed, null, 2));
    }
}

function test_GeminiClient() {
    const object = new GeminiClientTest();
    new Test(object).run();
}

class GeminiClientChatTest {
  before() {
    // GIVEN: starting history with one user turn
    this.initialHistory = [
      { role: 'user', parts: [{ text: 'Plan a 1-day Belize City itinerary.' }] }
    ];

    // We’ll assert that system_instruction + contents are posted
    const self = this;
    this.assertOnPayload = function (body) {
      // Check that contents equals our evolving history at call time
      Assert.isTrue(Array.isArray(body.contents), 'contents should be an array');
      Assert.equals(body.contents.length, self.client.history.length, 'contents length must match client.history length');

      // system_instruction should exist and match what we set
      Assert.isTrue(!!self.expectedSystemInstructionText, 'expectedSystemInstructionText should be set in test');
      Assert.isTrue(!!body.system_instruction, 'system_instruction should be present');
      const siPart = body.system_instruction.parts && body.system_instruction.parts[0] && body.system_instruction.parts[0].text;
      Assert.equals(siPart, self.expectedSystemInstructionText, 'system_instruction text mismatch');

      // generationConfig should be forwarded
      Assert.isTrue(!!body.generationConfig, 'generationConfig should be present');
      Assert.equals(body.generationConfig.temperature, 0.4, 'generationConfig.temperature mismatch');
    };

    // Fake model reply we expect to be appended to history
    this.fakeReply = 'Here is a concise 1-day plan with waterfront highlights.';

    // Create fake fetch
    this.fetch = this._makeFakeFetch(this.assertOnPayload, this.fakeReply);

    // Build client with injected fake fetch and initial history
    const apiKey = 'dummy-key';
    this.client = new GeminiClient(apiKey, {
      model: 'gemini-1.5-flash',
      history: JSON.parse(JSON.stringify(this.initialHistory)) // defensive copy
    }, this.fetch);

    // AND: set a system instruction
    this.expectedSystemInstructionText = 'Be concise, friendly, and factual.';
    this.client.setSystemInstruction(this.expectedSystemInstructionText);
  }

  after() {
    this.client = undefined;
  }

  test_send_appendsModelReply_and_keepsOrder() {
    // WHEN: we call send with a generationConfig
    const beforeLen = this.client.history.length;
    const response = this.client.send({ temperature: 0.4 });

    // THEN: response text is the fake reply
    Assert.equals(response, this.fakeReply, 'send() should return model text from response');

    // AND: history grew by 1
    Assert.equals(this.client.history.length, beforeLen + 1, 'history should append model turn');

    // AND: last turn is model with the same reply text
    const last = this.client.history[this.client.history.length - 1];
    Assert.equals(last.role, 'model', 'last role should be model');
    const lastText = last.parts && last.parts[0] && last.parts[0].text;
    Assert.equals(lastText, this.fakeReply, 'last text should equal model reply');

    // AND: the original order preserved (first turn still the initial user)
    const first = this.client.history[0];
    Assert.equals(first.role, 'user', 'first role should remain user');
  }

  test_truncateHistory_keepsTail() {
    // GIVEN: add a couple more turns
    this.client.addTurn('user', 'Add a family-friendly lunch spot.');
    this.client.addTurn('model', 'Consider BTL Park area food vendors.');
    this.client.addTurn('user', 'Ok, add evening activity near the waterfront.');

    const originalLen = this.client.history.length;

    // WHEN: truncate to last 2 parts
    this.client.truncateHistory(2);

    // THEN: length reduced
    Assert.equals(this.client.history.length, 2, 'truncateHistory should keep only last N');

    // AND: last two are the most recent turns in correct order
    const penultimate = this.client.history[0];
    const last = this.client.history[1];
    Assert.equals(penultimate.role, 'model', 'last should be model if last was model (after send)');
    Assert.equals(last.role, 'user', 'penultimate should be last user turn');
  }

  test_systemInstruction_canBeProvidedViaConstructor() {
    // GIVEN: new client where systemInstruction passes via opts (after fixing constructor bug)
    const expectedSI = 'Only return bullet lists.';
    const fetch = this._makeFakeFetch((body) => {
      Assert.isTrue(!!body.system_instruction, 'system_instruction should be present from constructor');
      const siText = body.system_instruction.parts[0].text;
      Assert.equals(siText, expectedSI, 'constructor-provided system instruction mismatch');
    }, '• Item 1\n• Item 2');

    const client2 = new GeminiClient('dummy-key', {
      history: [{ role: 'user', parts: [{ text: 'List two items.' }] }],
      systemInstruction: expectedSI
    }, fetch);

    // WHEN
    const reply = client2.send({ temperature: 0 });

    // THEN
    Assert.isTrue(reply.indexOf('•') === 0, 'reply should start with a bullet');
  }

  test_retry_succeeds_after_transient_errors() {
    // 500 → 500 → 200
    const seq = [
      { code: 500, body: 'server boom 1' },
      { code: 502, body: 'server boom 2' },
      { code: 200, body: { candidates: [{ content: { parts: [{ text: 'All good now' }] } }] } }
    ];
    const { fn, getCalls } = this._makeSequencedFetch(seq);

    const client = new GeminiClient('dummy', {
      history: [{ role: 'user', parts: [{ text: 'Hello' }] }]
    }, fn);

    const txt = client.send({ temperature: 0 });
    Assert.equals(txt, 'All good now', 'should eventually succeed');
    Assert.equals(getCalls(), 3, 'should attempt up to success');
  }

  test_retry_gives_up_after_3_and_throws() {
    const seq = [
      { code: 500, body: 'boom 1' },
      { code: 500, body: 'boom 2' },
      { code: 500, body: 'boom 3' },
      { code: 200, body: { candidates: [{ content: { parts: [{ text: 'too late' }] } }] } }
    ];
    const { fn } = this._makeSequencedFetch(seq);

    const client = new GeminiClient('dummy', {
      history: [{ role: 'user', parts: [{ text: 'Hi' }] }]
    }, fn);

    let threw = false;
    try { client.send({}); } catch (e) {
      threw = true;
      Assert.isTrue(String(e).indexOf('Gemini API error (HTTP 500)') >= 0, 'should reflect last HTTP error');
    }
    Assert.isTrue(threw, 'must throw after 3 failed attempts');
  }

  test_generateText_forwards_generationConfig() {
    const fakeFetch = (url, options) => {
      const body = JSON.parse(options.payload);
      Assert.isTrue(!!body.generationConfig, 'generationConfig should exist');
      Assert.equals(body.generationConfig.temperature, 0.9, 'temperature mismatch');
      return {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] })
      };
    };
    const client = new GeminiClient('dummy', {}, fakeFetch);
    const res = client.generateText('ping', { temperature: 0.9 });
    Assert.equals(res, 'ok', 'should return mocked text');
  }

  test_generateJSON_throws_on_invalid_json_text() {
    const fakeFetch = (url, options) => ({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({
        candidates: [{ content: { parts: [{ text: 'not-json-at-all' }] } }]
      })
    });
    const client = new GeminiClient('dummy', {}, fakeFetch);
    let threw = false;
    try { client.generateJSON('pls json'); } catch (e) {
      threw = true;
      Assert.isTrue(String(e).indexOf('did not return valid JSON') > -1, 'message should mention invalid JSON');
    }
    Assert.isTrue(threw, 'should throw on invalid JSON');
  }

  test_send_throws_when_history_empty() {
    const fakeFetch = (u,o) => ({ getResponseCode: () => 200, getContentText: () =>
      JSON.stringify({ candidates: [{ content: { parts: [{ text: 'should not be called' }] } }] })
    });
    const client = new GeminiClient('dummy', { history: [] }, fakeFetch);
    let threw = false;
    try { client.send({}); } catch(e) {
      threw = true;
      Assert.isTrue(String(e).indexOf('history is empty') >= 0, 'should mention empty history');
    }
    Assert.isTrue(threw, 'send should guard empty history');
  }

  test_sendJSON_returns_valid_json_and_appends() {
    const fakeFetch = (url, options) => {
      const body = JSON.parse(options.payload);
      Assert.equals(body.generationConfig.response_mime_type, 'application/json', 'must request JSON');
      return {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: '[{"ok":true}]' }] } }] })
      };
    };
    const client = new GeminiClient('dummy', { history: [{ role: 'user', parts: [{ text: 'Gimme JSON' }] }] }, fakeFetch);
    const jsonText = client.sendJSON({ type: 'array' }, { temperature: 0 });
    const arr = JSON.parse(jsonText);
    Assert.isTrue(Array.isArray(arr) && arr[0].ok === true, 'should be valid json');
    Assert.equals(client.history[client.history.length - 1].role, 'model', 'should append model turn');
  }

  test_setModel_updates_baseUrl() {
    const f = (u,o)=>({ getResponseCode:()=>200, getContentText:()=>JSON.stringify({candidates:[{content:{parts:[{text:'ok'}]}}]}) });
    const c = new GeminiClient('dummy', {}, f);
    const oldUrl = c.baseUrl;
    c.setModel('gemini-1.5-pro');
    Assert.isTrue(c.baseUrl.indexOf('gemini-1.5-pro') >= 0, 'baseUrl should reflect new model');
    Assert.isTrue(c.baseUrl !== oldUrl, 'baseUrl should change');
  }

  test_ensureCharBudget_keeps_tail_under_limit() {
    const f = (u,o)=>({ getResponseCode:()=>200, getContentText:()=>JSON.stringify({candidates:[{content:{parts:[{text:'ok'}]}}]}) });
    const c = new GeminiClient('dummy', {}, f);
    for (let i=0;i<50;i++) c.addTurn('user', 'x'.repeat(500));
    c.ensureCharBudget(3000); // ~6 turns
    Assert.isTrue(c.history.length <= 8, 'history should be trimmed to tail under budget');
    const r = c.send({});
    Assert.equals(r,'ok','still works after trimming');
  }

  _makeFakeFetch(assertOnPayload, replyText) {
    return function fakeFetch(url, options) {
      // Validate request body shape
      const body = JSON.parse(options.payload || '{}');
      if (typeof assertOnPayload === 'function') {
        assertOnPayload(body);
      }

      // Minimal Gemini response shape
      const response = {
        candidates: [
          {
            content: {
              parts: [{ text: replyText }]
            }
          }
        ]
      };

      return {
        getResponseCode: function () { return 200; },
        getContentText: function () { return JSON.stringify(response); }
      };
    };
  }

  _makeSequencedFetch(sequence) {
    let calls = 0;
    const fn = (url, options) => {
      const step = sequence[Math.min(calls, sequence.length - 1)];
      calls++;
      if (step.throw) throw new Error(step.throw);
      return {
        getResponseCode: () => step.code,
        getContentText: () => typeof step.body === 'string' ? step.body : JSON.stringify(step.body)
      };
    };
    return { fn, getCalls: () => calls };
  }
}

/** Runner */
function test_GeminiClientChat() {
  new Test(new GeminiClientChatTest()).run();
}

class GeminiClientChatEdgeCasesTest {
  /** Minimal try/catch assert since Assert.throws might not exist */
  static expectThrow(fn, messageContains) {
    let threw = false;
    try { fn(); } catch (e) {
      threw = true;
      if (messageContains) {
        Assert.isTrue(
          String(e).indexOf(messageContains) >= 0,
          'Error message should contain: ' + messageContains + ' but got: ' + e
        );
      }
    }
    Assert.isTrue(threw, 'Expected function to throw');
  }

  test_noSystemInstruction_omitsKey() {
    // GIVEN: client with no systemInstruction set
    const fakeFetch = function (url, options) {
      const body = JSON.parse(options.payload || '{}');
      // THEN: system_instruction should be absent
      Assert.isTrue(!('system_instruction' in body), 'system_instruction should not be present');
      // Return a valid reply
      return {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({
          candidates: [{ content: { parts: [{ text: 'OK' }] } }]
        })
      };
    };
    const client = new GeminiClient('dummy-key', {
      history: [{ role: 'user', parts: [{ text: 'Hello' }] }]
    }, fakeFetch);

    // WHEN
    const reply = client.send({ temperature: 0.1 });

    // THEN
    Assert.equals(reply, 'OK', 'reply should equal mocked text');
    const last = client.history[client.history.length - 1];
    Assert.equals(last.role, 'model', 'last role should be model');
  }

  test_extractText_throws_onUnexpectedShape() {
    // GIVEN: fake fetch that responds 200 but with empty candidates
    const badFetch = function (url, options) {
      return {
        getResponseCode: () => 200,
        getContentText: () => JSON.stringify({ candidates: [] })
      };
    };
    const client = new GeminiClient('dummy-key', {
      history: [{ role: 'user', parts: [{ text: 'Hi' }] }]
    }, badFetch);

    // WHEN/THEN: send() should throw from _extractText
    GeminiClientChatEdgeCasesTest.expectThrow(
      () => client.send({}),
      'Could not extract text from Gemini response'
    );
  }

  test_history_isDefensiveCopy() {
    const original = [{ role: 'user', parts: [{ text: 'Hi' }] }];
    const fakeFetch = (u,o) => ({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Yo' }] } }] })
    });

    const client = new GeminiClient('dummy-key', { history: original }, fakeFetch);

    // Mutate original after construct
    original.push({ role: 'user', parts: [{ text: 'Injected' }] });

    // Client history should NOT include injected turn if constructor copied
    Assert.equals(client.history.length, 1, 'history should be defensive-copied');
  }

  test_truncateHistory_zero_and_negative() {
    const fakeFetch = (u,o) => ({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] })
    });
    const client = new GeminiClient('dummy-key', { history: [] }, fakeFetch)
      .addTurn('user', 'u1')
      .addTurn('model', 'm1')
      .addTurn('user', 'u2');

    client.truncateHistory(0);
    Assert.equals(client.history.length, 0, 'truncateHistory(0) should clear history');

    // Rebuild and test negative
    client.addTurn('user', 'u1').addTurn('model', 'm1').addTurn('user', 'u2');
    client.truncateHistory(-5);
    Assert.equals(client.history.length, 0, 'truncateHistory(negative) should clear history');
  }

  test_chainable_helpers_returnThis() {
    const client = new GeminiClient('dummy-key', { history: [] }, (u,o)=>({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] })
    }));

    const same1 = client.setSystemInstruction('Keep it short');
    const same2 = client.addTurn('user', 'Hello');

    Assert.isTrue(same1 === client, 'setSystemInstruction should return this');
    Assert.isTrue(same2 === client, 'addTurn should return this');
  }

  test_clearHistory_resets() {
    const fakeFetch = (u,o) => ({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] })
    });
    const client = new GeminiClient('dummy-key', { history: [] }, fakeFetch)
      .addTurn('user', 'u1')
      .addTurn('model', 'm1');

    client.clearHistory();
    Assert.equals(client.history.length, 0, 'clearHistory should empty history');

    // Reuse after clearing
    client.addTurn('user', 'u2');
    const reply = client.send({});
    Assert.isTrue(!!reply, 'should still be usable after clearing');
  }

  test_addTurn_roleValidation() {
    const client = new GeminiClient('dummy-key', { history: [] }, (u,o)=>({
      getResponseCode: () => 200,
      getContentText: () => JSON.stringify({ candidates: [{ content: { parts: [{ text: 'ok' }] } }] })
    }));
    let threw = false;
    try { client.addTurn('assistant', 'oops'); } catch (e) { threw = true; }
    Assert.isTrue(threw, 'addTurn should throw on invalid role');
  }
}

/** Runner for the edge case tests */
function test_GeminiClientChatEdgeCases() {
  new Test(new GeminiClientChatEdgeCasesTest()).run();
}