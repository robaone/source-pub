function recoverEmails(request) {
  const container = configure();
  const result = container.recoveryService.run();
  console.log(JSON.stringify(result));
}
