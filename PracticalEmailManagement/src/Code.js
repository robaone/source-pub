// start-app-script
function doGet(request) {
  const container = configure();
  const result = container.recoveryService.run();
  console.log(JSON.stringify(result));
}
// end-app-script

module.exports = doGet;