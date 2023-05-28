const PROMPT="I am an engineer on a team.  Write a very short summary of today's activities in the first person based on the following";
const MAX_ACTIVITY_LENGTH=200

class EndOfDaySummaryService {
  constructor(translator, sheet){
    this.translationService = translator;
    this.sheet = sheet;
  }
  
  generate(activity) {
    const summary = this.translationService.translate(activity);
    return summary;
  }

  getActivity(startDate, endDate) {
    const sheet_data = this.sheet.getDataRange().getDisplayValues();
    const data_in_date_range = sheet_data.filter((data_row) => {
      const row_date = new Date(data_row[0]);
      const row_type = data_row[5];
      const is_activity_type = ['updateCheckItemStateOnCard','commentCard'].find((type) => type === row_type) !== undefined
      const in_date = row_date >= startDate && row_date <= endDate
      return in_date && is_activity_type;
    });
    const parsed_data = data_in_date_range.map((data) => {
      const payload = JSON.parse(data[2]);
      const text = payload.action?.data?.text;
      const date = payload.action.date;
      const title = payload.action.data.card.name;
      const card_id = payload.action.data.card.id;
      const checkItem = { 
        name:payload.action.data?.checkItem?.name,
        state:payload.action.data?.checkItem?.state
      }
      
      const parsed_data = data[5] === 'updateCheckItemStateOnCard' 
        ? {date, title, checkItem, card_id}
        : {text, date, title, card_id}

      return parsed_data
    })
    return this.groupAndSort(parsed_data);
  }

  groupAndSort(parsed_data) {
    const groupedData = parsed_data.reduce((result, item) => {
      const key = item.title;
      if (!result[key]) {
        result[key] = [];
      }
      const {title, card_id, ...card_details} = item;
      result[key].push(card_details);
      return result;
    }, {});
    return groupedData;
  }

  format(activity) {
    const formatted = Object.keys(activity).reduce((result, item, item_index) => {
      const item_activity = activity[item];
      const title = item;
      const bulleted_activity = item_activity.reduce((result, item) => {
        const activity_description = item.text === undefined || item.text === '' ? `${item.checkItem.state}: ${item.checkItem.name}` : item.text;
        const truncated_activity_description = truncateString(activity_description, MAX_ACTIVITY_LENGTH);
        return `${result}\n   • ${convertUtcToChicagoTime(item.date)}: ${truncated_activity_description}`
      } , '');
      return `${result}${result.length > 0 ? '\n\n' : ''}${item_index+1}. *${title}*\n${bulleted_activity}`;
    }, '');
    return formatted;
  }
}

function truncateString(str, num) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}

function sendSlackMessage(message) {
  var url = PropertiesService.getScriptProperties().getProperty('slack_webhook');
  var payload = {
    'text': "",
    'blocks': [
      {
        'type': "section",
        'text': {
          'type': 'mrkdwn',
          'text': '*Here\'s your end of day summary*'
        }
      },
      {
        'type': "section",
        'text': {
          'type': "mrkdwn",
          'text': message
        }
      }
    ] 
  };
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(url, options);
  console.log(response.getContentText());
}

function convertUtcToChicagoTime(utcString) {
  const utcDate = new Date(utcString);

  const utcTime = utcDate.getTime();

  const hours = utcDate.getHours() % 12 || 12;
  const minutes = utcDate.getMinutes().toString().padStart(2, '0');
  const amPm = utcDate.getHours() >= 12 ? 'PM' : 'AM';

  const chicagoTimeString = `${hours}:${minutes} ${amPm}`;

  return chicagoTimeString;
}

function getTodayRange() {
  var today = new Date();
  
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  
  var tomorrow = new Date(today);
  
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setMilliseconds(-1);
  
  return [today, tomorrow];
}

function isWeekend() {
  var today = new Date();
  var dayOfWeek = today.getDay();

  return (dayOfWeek === 0 || dayOfWeek === 6);
}

function test_endOfDaySummary() {
  // GIVEN
  const translator = {
    translate: (data) => "This is my summary"
  };
  const sheet = {
    getDataRange: () => [["2023-05-10T15:57:00.000"]]
  }
  const service = new EndOfDaySummaryService(translator, sheet);

  // WHEN
  const summary = service.generate(service.getActivity(new Date(), new Date()));

  // THEN
  if ( summary !== 'This is my summary'){
    throw "Invalid summary";
  }
}

function generateEODMessage() {
  const sheet = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('spreadsheet_id')).getSheetByName('Log');
  const translator = {
    translate: (data) => "This is my summary"
  };
  const service = new EndOfDaySummaryService(translator, sheet);
  const [today, tomorrow] = getTodayRange();
  const activity = service.getActivity(today, tomorrow);
  if(Object.keys(activity).length == 0){
    return undefined;
  }
  Logger.log(JSON.stringify(activity));
  const formatted_message = service.format(activity);
  Logger.log(formatted_message);
  return formatted_message;
}

function generateEOD() {
  if (isWeekend()){
    return;
  }
  const formatted_message = generateEODMessage();
  if(formatted_message === undefined){
    return;
  }
  sendSlackMessage(`*Today's Activity*\n\n${formatted_message}`);
  const open_ai = new OpenAI(UrlFetchApp.fetch, PropertiesService.getScriptProperties().getProperty('open_ai_key'));
  const response = open_ai.sendRequest('gpt-3.5-turbo',`${PROMPT};\n${formatted_message}`);
  Logger.log(JSON.stringify(response));
  sendSlackMessage(response.choices[0]?.message.content);
}