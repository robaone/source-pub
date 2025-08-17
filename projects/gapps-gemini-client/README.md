# gapps-gemini-client

A Google Apps Script client library for interacting with Google's Gemini AI API. This library provides a clean, feature-rich interface for generating text, structured JSON responses, and managing conversational AI interactions within Google Apps Script projects.

## Features

- **Text Generation**: Generate plain text responses from prompts
- **Structured JSON Output**: Force JSON responses with optional schema validation
- **Conversation Management**: Maintain conversation history with user/model turns
- **System Instructions**: Set persistent system-level instructions
- **Model Selection**: Switch between different Gemini models (e.g., gemini-1.5-flash, gemini-1.5-pro)
- **Automatic Retries**: Built-in retry logic with exponential backoff for transient errors
- **Character Budget Management**: Automatic conversation history trimming to stay within token limits
- **Comprehensive Testing**: Extensive test suite using the gapps-unit-test-library

## Dependencies

This project depends on the **gapps-unit-test-library** for its comprehensive test suite. The testing framework provides:
- Test class structure with `before()` and `after()` hooks
- Assertion utilities (`Assert.isTrue`, `Assert.match`, `Assert.deepEquals`)
- Automated test discovery and execution

## Setup

1. **API Key Configuration**: Set your Gemini API key as a Script Property named `gemini.key`
2. **Include Dependencies**: Ensure both `GeminiClient.js` and the `Test.js` from gapps-unit-test-library are included in your Google Apps Script project

## Basic Usage

### Simple Text Generation

```javascript
const client = new GeminiClient(PropertiesService.getScriptProperties().getProperty('gemini.key'));

// Generate plain text
const response = client.generateText('Write a 2-sentence fun fact about Belize.', { 
  temperature: 0.7 
});
console.log(response);
```

### Structured JSON Output

```javascript
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

const response = client.generateJSON(
  'Return 3 Belize travel attractions as JSON array of {district, attraction, tags}.',
  schema,
  { temperature: 0.2 }
);

const attractions = JSON.parse(response);
```

### Conversational AI

```javascript
// Initialize with conversation history
const client = new GeminiClient(apiKey, {
  history: [
    { role: 'user', parts: [{ text: 'Plan a 1-day Belize City itinerary.' }] }
  ],
  systemInstruction: 'Be concise, friendly, and factual.'
});

// Send message and get response
const response = client.send({ temperature: 0.4 });

// Add follow-up
client.addTurn('user', 'Add a family-friendly lunch spot.');
const followUpResponse = client.send({ temperature: 0.4 });
```

## API Reference

### Constructor

```javascript
new GeminiClient(apiKey, opts = {}, fetch = UrlFetchApp.fetch)
```

**Parameters:**
- `apiKey` (string): Your Gemini API key
- `opts` (object, optional):
  - `model` (string): Gemini model name (default: 'gemini-1.5-flash')
  - `timeoutMs` (number): Request timeout in milliseconds (default: 60000)
  - `history` (array): Initial conversation history
  - `systemInstruction` (string): System-level instruction
- `fetch` (function): Fetch function for testing (default: UrlFetchApp.fetch)

### Core Methods

#### `generateText(prompt, generationConfig = {})`
Generate plain text from a prompt.

#### `generateJSON(prompt, schema = undefined, config = {})`
Generate structured JSON output with optional schema validation.

#### `send(generationConfig = {})`
Send the current conversation and get model reply. Appends the response to history.

#### `sendJSON(schema = undefined, config = {})`
Send conversation and force JSON response with optional schema.

### Conversation Management

#### `addTurn(role, text)`
Add a user or model turn to conversation history.

#### `clearHistory()`
Clear all conversation history.

#### `truncateHistory(maxParts = 20)`
Trim history to keep last N parts.

#### `ensureCharBudget(maxChars = 12000)`
Ensure history stays under character budget (rough proxy for tokens).

### Configuration

#### `setModel(model)`
Switch to a different Gemini model.

#### `setSystemInstruction(text)`
Set a persistent system instruction.

## Testing

The library includes comprehensive tests that demonstrate proper usage:

- **Basic Functionality**: API key validation, text generation, JSON responses
- **Conversation Management**: History management, turn handling, system instructions
- **Error Handling**: Retry logic, invalid responses, edge cases
- **Configuration**: Model switching, character budget management

Run tests using the provided test functions:
- `test_GeminiClient()` - Basic functionality tests
- `test_GeminiClientChat()` - Conversation management tests  
- `test_GeminiClientChatEdgeCases()` - Edge case and error handling tests

## Error Handling

The client includes robust error handling:
- Automatic retries with exponential backoff for transient errors
- Validation of API responses and JSON output
- Clear error messages for common issues
- Graceful handling of empty conversation history

## Examples

See the test classes in the source code for comprehensive usage examples covering all features and edge cases.


