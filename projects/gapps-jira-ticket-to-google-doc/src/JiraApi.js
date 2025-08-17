class JiraAPI {
  constructor(fetchService,credentials, url) {
    this.fetchService = fetchService;
    this.username = credentials.username;
    this.api_token = credentials.token;
    this.url = url;
    const api = this;
    this.request_options = () => {
      return {
        headers: {
          'Authorization': 'Basic ' + Utilities.base64Encode(api.username + ':' + api.api_token)
        }
      }
    }
  }
  getTickets(jql) {
    const url = this.url + '/rest/api/2/search?jql=' + encodeURIComponent(jql) + '&maxResults=100';
    const response = this.fetchService(url, this.request_options());
    const json = response.getContentText();
    const data = JSON.parse(json);
    for(let index = 1; index < 5 ; index++) {
      const incrementalUrl = `${url}&startAt=${index*100}`;
      const incrementalResponse = this.fetchService(incrementalUrl, this.request_options());
      const incrementalData = JSON.parse(incrementalResponse.getContentText());
      if(incrementalData.issues.length > 0){
        incrementalData.issues.forEach(issue => data.issues.push(issue));
      }else{
        break;
      }
    }
    return data;
  }
  getTicket(ticketId) {
    const url = this.url + '/rest/api/2/issue/' + ticketId;
    const response = this.fetchService(url, this.request_options());
    const json = response.getContentText();
    const data = JSON.parse(json);
    return data; 
  }
  getTicketComments(ticketId) {
    const url = this.url + '/rest/api/2/issue/' + ticketId + '/comment';
    const response = this.fetchService(url, this.request_options());
    const json = response.getContentText();
    const data = JSON.parse(json);
    return data;
  }
  getReleases(project) {
    const url = this.url + '/rest/api/3/project/' + project + '/version?status=unreleased';
    const response = this.fetchService(url, this.request_options());
    const json = response.getContentText();
    const data = JSON.parse(json);
    return data;
  }
  getUpdateDateFilter(date) {
    if(date === undefined){
      return ''
    }
    var timeZone = Session.getScriptTimeZone();
    var format = 'yyyy-MM-dd HH:mm';
    return `Updated > '${Utilities.formatDate(date, timeZone, format)}' and `;
  }
}

class JiraApiTest {
  test_getTickets() {
    // GIVEN
    const fetchService = (url, options) => {
      console.log(`fetching from ${url} with options ${JSON.stringify(options)}`);
      return {
        getContentText: () => '{"issues":[]}'
      };
    };
    const credentials = {
      username: 'user',
      token: 'token'
    };
    const jiraApi = new JiraAPI(fetchService, credentials);
    const jql = 'project = BILL'

    // WHEN
    const result = jiraApi.getTickets(jql);

    // THEN
    Assert.match("{\"issues\":[]}",JSON.stringify(result));
  }
  test_getReleases() {
    // GIVEN
    const fetchService = (url, options) => {
      console.log(`fetching from ${url} with options ${JSON.stringify(options)}`);
      return {
        getContentText: () => JSON.stringify({"isLast":false,"maxResults":2,"nextPage":"https://your-domain.atlassian.net/rest/api/3/project/PR/version?startAt=2&maxResults=2","self":"https://your-domain.atlassian.net/rest/api/3/project/PR/version?startAt=0&maxResults=2","startAt":0,"total":7,"values":[{"archived":false,"description":"An excellent version","id":"10000","name":"New Version 1","overdue":true,"projectId":10000,"releaseDate":"2010-07-06","released":true,"self":"https://your-domain.atlassian.net/rest/api/3/version/10000","userReleaseDate":"6/Jul/2010"},{"archived":false,"description":"Minor Bugfix version","id":"10010","issuesStatusForFixVersion":{"done":100,"inProgress":20,"toDo":10,"unmapped":0},"name":"Next Version","overdue":false,"projectId":10000,"released":false,"self":"https://your-domain.atlassian.net/rest/api/3/version/10010"}]})
      };
    };
    const credentials = {
      username: 'user',
      token: 'token'
    };
    const jiraApi = new JiraAPI(fetchService, credentials);
    const project = 'BILL'

    // WHEN
    const result = jiraApi.getReleases(project);

    // THEN
    Assert.match(2,result.maxResults);
  }
  test_updateDateFilter() {
    // GIVEN
    const fetchService = (url, options) => {
      console.log(`fetching from ${url} with options ${JSON.stringify(options)}`);
      return {
        getContentText: () => '{"issues":[]}'
      };
    };
    const credentials = {
      username: 'user',
      token: 'token'
    };
    const jiraApi = new JiraAPI(fetchService, credentials);

    // WHEN
    [{date:undefined,expected:''},{date:new Date('2024-01-01 09:00'),expected:"Updated > '2024-01-01 09:00' and "}].forEach(scenario => {
      const response = jiraApi.getUpdateDateFilter(scenario.date);

      // THEN
      Assert.match(scenario.expected,response);
    })
  }
}

function test_jiraAPI () {
  const object = new JiraApiTest();
  new Test(object).run();
}