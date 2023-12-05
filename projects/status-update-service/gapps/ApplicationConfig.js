const DEFAULT_EVENT_DURATION_MIN = 30;
const COMMENT_IMPORTER = 'comment_importer';
const AUTHOR_ID = 'author_id';
const COMMENT_PROCESS_DATE = 'comment_process_date';
const COMMENT_SPREADSHEET_ID = 'comment_spreadsheet_id';
const COMMENTS = 'comments';
const USER_IDS = 'userIds';
const BOARD_ID = 'board_id';
const LIST_ID = 'list_id';
// APPLICATION CONFIGURATION
function loadConfig(){
  var container = new Container();
  container.register('spreadsheet',SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('sheet_id')));
  container.register('primaryMemberId',PropertiesService.getScriptProperties().getProperty('primaryMemberId'));
  container.register('personalMemberId',PropertiesService.getScriptProperties().getProperty('personalMemberId'));
  container.register('slack_access_token',PropertiesService.getScriptProperties().getProperty('access_token'));
  container.register('conjugator',new Conjugator(container.get('spreadsheet')));
  const memberId = PropertiesService.getScriptProperties().getProperty('memberId');
  const memberIds = memberId ?? [container.get('primaryMemberId'),container.get('personalMemberId')];
  container.register('post_handler',new DataHandler(container.get('spreadsheet').getSheetByName('Log'),memberIds,container.get('conjugator')));
  container.register('slack_bot_oauth_token',PropertiesService.getScriptProperties().getProperty('slack_bot_oauth_token'));
  container.register('slack_client_id',PropertiesService.getScriptProperties().getProperty('slack_client_id'));
  container.register('slack_client_secret',PropertiesService.getScriptProperties().getProperty('slack_client_secret'));
  container.register('page_renderer', new PageRenderer(container.get('slack_client_id'),PropertiesService.getScriptProperties().getProperty('redirect_uri')));
  container.register('get_function',function(options,url){
    options['method'] = 'get';
    var response = UrlFetchApp.fetch(url,options);
    return response.getContentText();
  });
  container.register('post_function',function(options,url){
    options['method'] = 'post';
    const response = UrlFetchApp.fetch(url,options);
    return response.getContentText();
  });
  container.register('auth_service',{'getAccessToken': function(memberId){
    var spreadsheet = container.get('spreadsheet');
    var sheet = spreadsheet.getSheetByName('Authorizations');
    var range = sheet.getDataRange();
    var values = range.getValues();
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      if(row[0] == memberId){
        var auth_info = JSON.parse(row[1]);
        return auth_info.authed_user.access_token;
      }
    }
  }});
  container.register('emoji_picker',function(verb){
    var spreadsheet = container.get('spreadsheet');
    var sheet = spreadsheet.getSheetByName('Verbs');
    var range = sheet.getDataRange();
    var values = range.getValues();
    var headers = values[0];
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      var verb_info = mapArrayToHeaders(row,headers);
      if(verb == verb_info.progressive ||
        verb == verb_info.verb ||
        verb == verb_info.past){
          return ':'+verb_info.emoji+':';
        }
    }
    return ':clipboard:';
  });
  container.register('calendar_service',new CalendarService(CalendarApp.getDefaultCalendar(),Logger));
  container.register('oauth',new OAuth(container.get('slack_client_id'),container.get('slack_client_secret'),'https://slack.com/api/oauth.v2.access',container.get('post_function')));
  container.register('get_handler',new PageHandler(container.get('spreadsheet'),container.get('oauth')));
  container.register('slack_post_url',PropertiesService.getScriptProperties().getProperty('slack_post_url'));
  const calendar = CalendarApp.getCalendarById(PropertiesService.getScriptProperties().getProperty('work_log_calendar_id'));
  const calendar_service = new CalendarService(calendar,Logger,CalendarApp.getDefaultCalendar());
  container.register('slack_api',new SlackAPI(container.get('slack_post_url'),container.get('post_function'),undefined,container.get('calendar_service')));
  container.register('post_handle_listeners',[
      function(data){
        if(data.statusMessage){
          const event_date = data.content.action.date ? new Date(data.content.action.date) : new Date();
          var publisher = new SlackPublisher(
            container.get('spreadsheet').getSheetByName('Status Messages'),
            container.get('slack_api'),
            function(data){
              var logger = new MessageLogger(container.get('spreadsheet').getSheetByName('Status Messages'));
              logger.log(data);
            },
            event_date,
            calendar_service
          );
          var auth_service = container.get('auth_service');
          var emoji_picker = container.get('emoji_picker');
          data['access_token'] = auth_service.getAccessToken(data.memberId);
          data['emoji'] = emoji_picker(
            data.statusMessage.toLowerCase().includes("meeting") ||
            data.statusMessage.toLowerCase().includes("check-in") ? 'meet' : data.statusMessage.split(' ')[0].toLowerCase());
          publisher.publish(data);
        }
      },
      function(data){
        if(data.statusMessage){
          calendar_service.addEvent(data);
        }
      }
    ]
  );
  container.register('trello_key',PropertiesService.getScriptProperties().getProperty('trello_key'));
  container.register('trello_token',PropertiesService.getScriptProperties().getProperty('trello_token'));
  container.register('trello_api',new TrelloAPI(container.get('trello_key'),container.get('trello_token'),container.get('get_function'),container.get('post_function')));
  container.register('data_filter',function(data){
    var filters = [
      function(data){
        var filter = new SkipPrivateCardFilter(container.get('trello_api'));
        return filter.filter(data);
      }
    ];
    for(var i = 0; i < filters.length; i++){
      data = filters[i](data);
    }
    return data;
  });
  const spreadsheet = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty(COMMENT_SPREADSHEET_ID));
  const sheet = spreadsheet.getSheetByName(COMMENTS);
  const user_sheet = spreadsheet.getSheetByName(USER_IDS);
  const userIds = (
    () => {
      if (user_sheet) { 
        const retrieved_user_ids = user_sheet.getDataRange().getValues().reduce((accumulator,row,index) => {
          if(index == 0){
            accumulator['headers'] = row;
          }else{
            const user_info = accumulator.headers.reduce((obj,column,index) => {
              obj[column.toLowerCase()] = row[index];
              return obj;
            },{});
            accumulator[user_info.id] = user_info.name
          }
          return accumulator;
        },{});
        delete retrieved_user_ids.headers;
        return retrieved_user_ids;
      }else{
        return {};
      }
    }
  )();
  container.register('jira_formatter',new JiraFormatter(userIds));
  container.register(
    COMMENT_IMPORTER,
    new CommentImporter(
      sheet,
      container.get('trello_api'),
      PropertiesService.getScriptProperties().getProperty(AUTHOR_ID),
      PropertiesService.getScriptProperties().getProperty(BOARD_ID),
      PropertiesService.getScriptProperties().getProperty(LIST_ID),
      new Date(
        PropertiesService.getScriptProperties().getProperty(COMMENT_PROCESS_DATE)
      ),
      container.get('jira_formatter'),
      (process_date) => {
        PropertiesService.getScriptProperties().setProperty(COMMENT_PROCESS_DATE,process_date)
      }
    )
  );
  return container;
}

