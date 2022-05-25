const MailRecovery = require("./MailRecovery");

// start-app-script
function configure() {
  const emailService = {
    search:() =>{},
    move:() =>{}
  };
  const queryService = {
    getQueries: () => {}
  };
  const recoveryService = new MailRecovery(emailService,queryService);
  return {
    recoveryService
  };
}
// end-app-script