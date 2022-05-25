const MailRecovery = require('../src/MailRecovery');

test('can be declared', () => {
  const service = new MailRecovery();
});

test('recover emails matching query', () => {
  const mailRecovery = new MailRecovery();
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
  // And queries with data:
  const queries = [
    'from:myfriend@email.com'
  ];
  // When the timer is triggered
  const result = mailRecovery.run();
  // Then the following emails are moved to the inbox
  expect(result).toEqual({
    recovered:[{title:'This is good',from:'myfriend@email.com'}],
    queries:['from:myfriend@email.com']
  })
})