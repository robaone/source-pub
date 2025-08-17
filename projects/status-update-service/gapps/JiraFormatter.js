class JiraFormatter {
  constructor(userIds) {
    this.userIds = userIds;
    this.formatters = [
      this.userIdFormatter,
      this.inlineCodeFormatter,
      this.preFormattedCodeFormatter,
      this.linkFormatter,
      this.boldFormatter
    ];
  }
  toTrelloComment(jiraComment) {
    const trello_formatted_comment = this.formatters.reduce((comment, formatter) => formatter(comment,this), jiraComment);
    return trello_formatted_comment;
  }
  linkFormatter(comment) {
    const markdownLinks = comment.replace(/\[([^\]]+)\|([^\]]+)\]/g, '[$1]($2)');
    return markdownLinks;
  }
  boldFormatter(comment) {
    const markdownBold = comment.replace(/\*([^*]+)\*/g, '**$1**');
    return markdownBold;
  }
  inlineCodeFormatter(comment) {
    const markdownInlineCode = comment.replace(/\{\{([^}]+)\}\}/g, '`$1`');
    return markdownInlineCode;
  }
  preFormattedCodeFormatter(comment) {
    const markdownCodeBlocks = comment.replace(/\{noformat\}([\s\S]*?)\{noformat\}/g, '```\n$1\n```');
    return markdownCodeBlocks;
  }
  userIdFormatter(comment,formatter) {
    const trelloComment = comment.replace(/~accountid:([^|\]]+)/g, (match, userId) => {
      if (formatter.userIds && formatter.userIds[userId]) {
        return `@${formatter.userIds[userId]}`;
      }else{
        return `@unknown`;
      }
      return match;
    });
    const markdownLinks = trelloComment.replace(/\[([^\]]+)\|@([^\]]+)\]/g, '@$2');
    const cleanedUpLinks = markdownLinks.replace(/\[(@[a-zA-Z\s]+)\]/g, '$1');
    return cleanedUpLinks;
  }
  isWithinCode(comment, start_index) {
    if (start_index == -1){
      return comment;
    }
    const preformatted_code_regex = /\`\`\`\n([^\n]+)\n\`\`\`/g;
    const inline_code_regex = /\`([^\`]+)\`/g;  
    const comment_ranges = [preformatted_code_regex,inline_code_regex].reduce((comment_index_ranges, regex) => {
      const start_index = comment.search(regex);
      if(start_index == -1) {
        return comment_index_ranges;
      }
      const end_index = start_index + comment.match(regex)[0].length;
      comment_index_ranges.push({start_index, end_index});
      return comment_index_ranges;
    },[]);
    
    const is_within_code = comment_ranges.reduce((within_code, comment_range) => {
      const is_within = within_code || start_index >= comment_range.start_index && start_index <= comment_range.end_index;
      return is_within;
    },false);
    return is_within_code;
  }
}

function replaceBetween(str, start, end, newStr) {
  return str.substring(0, start) + newStr + str.substring(end);
}

class JiraFormatterTest {
  test_formatting() {
    [
      {
        input: "[https://github.com/user/reop/actions/runs/6327774475/job/17234424215#step:10:580|https://github.com/user/repo/actions/runs/6327774475/job/17234424215#step:10:580]",
        expected: "[https://github.com/user/repo/actions/runs/6327774475/job/17234424215#step:10:580](https://github.com/user/repo/actions/runs/6327774475/job/17234424215#step:10:580)"
      },
      {
        input: "This is a link [Google|https://www.google.com]",
        expected: "This is a link [Google](https://www.google.com)"
      },
      {
        input: "Some *Jira text* formatting [example|https://example.com].",
        expected: "Some **Jira text** formatting [example](https://example.com)."
      },
      {
        input: "[Winston Smith|~accountid:internal-id] woke up with the word 'Shakespeare' on his lips",
        userIds: {"internal-id": "winston"},
        expected: "@winston woke up with the word 'Shakespeare' on his lips"
      },
      {
        input: "This is a code snippet.\n{noformat}{\n  \"Version\": \"2012-10-17\"\n}{noformat}",
        expected: "This is a code snippet.\n```\n{\n  \"Version\": \"2012-10-17\"\n}\n```"
      },
      {
        input: "This is {{inline code}}",
        expected: "This is `inline code`"
      },
      {
        input: "This is a test {{comment}} containing a mention of [~accountid:5e6f874de3a02f0c43eaa7a3] along with a [link|https://site.robaone.com] and {noformat}a code\n  block{noformat}",
        expected: "This is a test `comment` containing a mention of @unknown along with a [link](https://site.robaone.com) and ```\na code\n  block\n```"
      },
      {
        input: "This is a test {{comment}} containing a mention of [~accountid:5e6f874de3a02f0c43eaa7a3] along with a [link|https://site.robaone.com] and {noformat}a code\n  block{noformat}",
        expected: "This is a test `comment` containing a mention of @Ansel Robateau along with a [link](https://site.robaone.com) and ```\na code\n  block\n```",
        userIds: {"5e6f874de3a02f0c43eaa7a3": "Ansel Robateau"}
      }
    ].forEach(scenario => {
      Logger.log(`Testing ${scenario.input}`);
      // GIVEN
      const input = scenario.input;
      const formatter = new JiraFormatter(scenario.userIds);
      
      // WHEN
      const output = formatter.toTrelloComment(input);
      
      // THEN
      Assert.match(scenario.expected, output);
    });
  }
}

function test_JiraFormatter() {
  const object = new JiraFormatterTest();
  new Test(object).run();
}