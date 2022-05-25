const MailRecovery = require('../src/MailRecovery');


test('can be declared', () => {
  const service = new MailRecovery();
});

describe('recovering emails', () => {
  beforeEach(() => {
    this.emailService = {
      search: jest.fn(),
      move: jest.fn()
    };
    this.queryService = {
      getQueries: jest.fn()
    }
    this.service = new MailRecovery(this.emailService,this.queryService);
  })
  test('recover emails matching query', () => {
    const mailRecovery = this.service;
    // Given emails in other folder with data:
    const emails = [
      {
        title:'This is spam',
        from:'spam@email.com'
      },
      {
        title:'This is good',
        from:'myfriend@email.com'
      }
    ];
    this.emailService.search.mockReturnValueOnce(emails);
    this.emailService.move.mockReturnValueOnce(emails[1]);
    // And queries with data:
    const queries = [
      'from:myfriend@email.com'
    ];
    this.queryService.getQueries.mockReturnValue(queries);
    // When the timer is triggered
    const result = mailRecovery.run();
    // Then the following emails are moved to the inbox
    expect(result).toEqual({
      recovered:[{title:'This is good',from:'myfriend@email.com'}],
      queries:['from:myfriend@email.com']
    })
  })
});