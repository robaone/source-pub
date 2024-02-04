class DescriptionGenerator {
  constructor(open_ai,story_template,bug_template) {
    this.open_ai = open_ai;
    this.story_template = story_template;
    this.bug_template = bug_template;
    this.STORY = 'story';
    this.BUG = 'bug';
  }
  generate(description,type) {
    switch(type){
      case this.STORY:
        Logger.log(`story: ...`);
        return this.transform(description,this.story_template);
      case this.BUG:
        Logger.log(`bug: ...`);
        return this.transform(description,this.bug_template);
      default:
        Logger.log(`story: ...`);
        return this.transform(description,this.story_template);
    }
  }
  transform(description,template) {
    const populated_prompt = template.prompt.replace(template.placeholder,description);
    const response = this.open_ai.call(populated_prompt);
    return response;
  }
}

class DescriptionGeneratorTest {
  before() {
    this.calls = [];
    this.responses = [];
    this.responses_index = 0;
    const test = this;
    this.open_ai = {
      call: (prompt) => {
        test.calls.push({
          scope: 'open_ai.call',
          arguments: [prompt]
        });
        return test.responses[test.responses_index++];
      }
    }
  }
  test_transformStoryTemplate() {
    // GIVEN
    this.responses.push('This is a test');
    const story_template = {placeholder: '#PLACEHOLDER#', prompt: 'This is the story: #PLACEHOLDER#'};
    const bug_template = {placeholder: '#PLACEHOLDER#', prompt: 'This is the bug: #PLACEHOLDER#'};
    const generator = new DescriptionGenerator(this.open_ai,story_template,bug_template);

    // WHEN
    const results = generator.generate('This is the description',generator.STORY);

    // THEN
    Assert.match('This is a test',results);
    Assert.deepEquals([{scope:'open_ai.call',arguments: ['This is the story: This is the description']}],this.calls);
  }
  test_transformBugTemplate() {
    // GIVEN
    this.responses.push('This is a test');
    const story_template = {placeholder: '#PLACEHOLDER#', prompt: 'This is the story: #PLACEHOLDER#'};
    const bug_template = {placeholder: '#PLACEHOLDER#', prompt: 'This is the bug: #PLACEHOLDER#'};
    const generator = new DescriptionGenerator(this.open_ai,story_template,bug_template);

    // WHEN
    const results = generator.generate('This is the description',generator.BUG);

    // THEN
    Assert.match('This is a test',results);
    Assert.deepEquals([{scope:'open_ai.call',arguments: ['This is the bug: This is the description']}],this.calls);
  }

  test_transformDefaultTemplate() {
    // GIVEN
    this.responses.push('This is a test');
    const story_template = {placeholder: '#PLACEHOLDER#', prompt: 'This is the story: #PLACEHOLDER#'};
    const bug_template = {placeholder: '#PLACEHOLDER#', prompt: 'This is the bug: #PLACEHOLDER#'};
    const generator = new DescriptionGenerator(this.open_ai,story_template,bug_template);

    // WHEN
    const results = generator.generate('This is the description',generator.STORY);

    // THEN
    Assert.match('This is a test',results);
    Assert.deepEquals([{scope:'open_ai.call',arguments: ['This is the story: This is the description']}],this.calls);
  }
}

function test_DescriptionGenerator() {
  const object = new DescriptionGeneratorTest();
  new Test(object).run();
}
