// start-app-script
class MailRecovery {
  constructor(emailService,queryService){
    this.emailService = emailService;
    this.queryService = queryService;
  }
  run(){
    const queries = this.queryService.getQueries();
    const emails = queries.map(
      query => this.emailService.search(query).map(email => {
      return this.emailService.move(email,'Inbox');
    })).flat().filter(x => x !== undefined);
    return {
      recovered:emails,
      queries
    }
  }
  move(query){
    return this.emailService.search(query).map(email => {
      return this.emailService.move(email,'Inbox');
    });
  }
}

// end-app-script

module.exports = MailRecovery;