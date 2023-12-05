const PROCESSED_HEADER='processed';
const SLEEP_DURATION=60*1000;
const ATLASSIAN_URL_PREFIX=PropertiesService.getProperty('atlassian_url_prefix');
class CommentImporter {
  constructor(sheet,trello_api,authorId,board_id,list_id,start_date, formatter, callback) {
    this.sheet = sheet;
    this.trello_api = trello_api;
    this.authorId = authorId;
    this.start_date = start_date;
    this.callback = callback;
    this.board = board_id;
    this.list = list_id;
    this.formatter = formatter;
  }
  run() {
    Logger.log('Running CommentImporter');
    const data = this.sheet.getDataRange().getValues();
    let headers = data[0];
    let process_date = undefined;
    const comments_to_add = [];
    if(headers.filter(header => header.toLowerCase() === PROCESSED_HEADER).length == 0){
      headers = this.addHeader(PROCESSED_HEADER,this.sheet);
    }
    for(var i = 1; i < data.length; i++){
      const record = headers.reduce((accumulator,header,currentIndex) => {
        accumulator[header.toLowerCase()] = data[i][currentIndex];
        return accumulator;
      },{});
      const content = JSON.parse(record.content);
      if(record.processed){
        continue;
      }
      if(this.start_date && (this.start_date.getTime() > new Date(content.created).getTime())){
        continue;
      }
      if(content.authorId == this.authorId) {
        const ticketId = content.key;
        const existingCards = this.trello_api.findCards(this.board, ticketId);
        const openCards = existingCards.cards.filter(card => {
          return card.closed == false;
        });
        const matchingCard = openCards.find((card) => {
          return card.name == `${content.title} - ${content.key}`;
        });
        const formatted_body = this.formatter.toTrelloComment(content.body)
        if (matchingCard == undefined) {
          const new_card = this.createNewCard({title: `${content.title} - ${content.key}`,description: `[${ATLASSIAN_URL_PREFIX}${ticketId}](${ATLASSIAN_URL_PREFIX}${ticketId} "smartCard-block")`});
          comments_to_add.push({card: new_card, comment: formatted_body, row: i + 1, index: i});
        }else{
          comments_to_add.push({card: matchingCard, comment: formatted_body, row: i + 1, index: i});
        }
      }
    }
    const process_result = comments_to_add.map((comment_data, index) => {
      if(process_date){
        process_date = process_date.getTime() > new Date(comment_data.card.dateLastActivity).getTime()
          ? process_date
          : comment_data.card.created
      }else{
        process_date = new Date(comment_data.card.dateLastActivity);
      }
      // sleep for 1 if not first item
      if(index > 0){
        sleep(SLEEP_DURATION);
      }
      const saved_comment = this.saveComment(comment_data.card, comment_data.comment);
      const updated_row = headers.reduce((accumulator, header, index) => {
        const value = header === PROCESSED_HEADER
          ? new Date()
          : data[comment_data.index][index];
        accumulator.push(value);
        return accumulator;
      }, []);
      this.sheet.getRange(comment_data.row, 1, 1,updated_row.length).setValues([updated_row]);
      return saved_comment;
    });
    Logger.log(`Added ${process_result.length} comments`);
    if (process_date) {
      Logger.log(`Latest processed comment created at ${process_date}`);
      this.callback(process_date);
    }
  }
  createNewCard({title,description}) {
    return this.trello_api.createCard(this.list,{name:title,desc:description})
  }
  saveComment(card, comment) {
    return this.trello_api.addComment(card,comment);
  }
  addHeader(header,sheet){
    const header_row = sheet.getDataRange().getValues()[0];
    header_row.push(header);
    sheet.getRange(1,1,1,header_row.length).setValues([header_row]);
    return header_row;
  }
}

function sleep(duration) {
  var startTime = new Date().getTime();
  while(new Date().getTime() < startTime + duration) {
    // do nothing
  }
}

function test_trelloSearch() {
  const board='5f73576d8c515547938c3535';
  const search_str='AC-38';
  const container = loadConfig();
  const trello_api = container.get('trello_api');
  const response = trello_api.findCards(board,search_str);
  Logger.log(JSON.stringify(response));
}

function test_trelloCreateCard() {
  const list_id='5f73576d8c515547938c3539';
  const container = loadConfig();
  const trello_api = container.get('trello_api');
  const new_card={name: 'New Card Name - AC-7',desc: '[https://atlassian.net/browse/AC-7](https://atlassian.net/browse/AC-7 "smartCard-block")'};
  const response = trello_api.createCard(list_id,new_card);
  Logger.log(JSON.stringify(response));
}

function test_trelloAddComment() {
  const card = {id: '6514922a2e9fc625d26ccbfb'};
  const trello_api = loadConfig().get('trello_api');
  const new_comment = trello_api.addComment(card,'This is a test comment');
  Logger.log(JSON.stringify(new_comment));
}

function test_commentImporter() {
  [
    {
      existingCard: undefined,
      start_date: undefined
    },
    {
      existingCard: {closed: false, id: 'existing_card'},
      start_date: undefined
    },
    {
      existingCard: undefined,
      start_date: new Date('2023-09-24')
    },
    {
      existingCard: {closed: false, id: 'existing_card'},
      start_date: new Date('2023-09-24')
    }
  ].forEach(scenario => {
    // GIVEN
    const test_results = [];
    const new_card = {id: 'new_card',name:'Name of card',desc:'[https://atlassian.net/browse/AC-123](https://atlassian.net/browse/AC-123 "smartCard-block")'};
    const test_comment = PropertiesService.getScriptProperties().getProperty('test_comment');
    const values = [['Date','Content'],['2023-09-24',test_comment]];
    const getValues = function(){ return values;};
    const sheet = {
      getDataRange: function() { return {getValues}},
      getRange: () => { return {setValues: (values) => Logger.log(`setValues(${values})`)}}
    };
    const trello_api = {
      findCards: () => scenario.existingCard ? {cards:[scenario.existingCard]} : {cards:[]},
      createCard: () => new_card,
      addComment: (card,comment) => test_results.push(`Add ${comment} to ${card.id}`)
    };
    const formatter = {
      toTrelloComment: (comment) => comment
    };
    const author_id = '5e6f874de3a02f0c43eaa7a3';
    const board_id = 'board_123';
    const list_id = 'list_123';
    const callback = (processed_date) => Logger.log(processed_date);
    const service = new CommentImporter(sheet,trello_api,author_id,board_id,list_id,scenario.start_date,formatter,callback);

    // WHEN
    service.run();

    // THEN
    Logger.log(`${JSON.stringify(test_results)}`);

  });
}