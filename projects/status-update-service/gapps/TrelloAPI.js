class TrelloAPI {
  constructor(key,token,getFunction,postFunction){
    this.key = key;
    this.token = token;
    this.getFunction = getFunction;
    this.postFunction = postFunction;
    this.url = 'https://api.trello.com/1';
  }
  getCard(id) {
    var options = {
      'method': 'get',
      'headers': {'Accept':'application/json'}
    };
    var result = this.getFunction(options,`${this.url}/cards/${id}?key=${this.key}&token=${this.token}`);
    return JSON.parse(result);
  }
  findCards(board, search_str) {
    var options = {
      'method': 'get',
      'headers': {'Accept':'application/json'}
    };
    var result = this.getFunction(options,`${this.url}/search?query=board:${board} ${search_str}&key=${this.key}&token=${this.token}`);
    return JSON.parse(result);
  }
  createCard(list_id,card) {
    var options = {
      'method': 'post',
      'headers': {'Accept': 'application/json'}
    };
    var result = this.postFunction(options,`${this.url}/cards?idList=${list_id}&name=${encodeURIComponent(card.name)}&desc=${encodeURIComponent(card.desc)}&key=${this.key}&token=${this.token}`);
    return result;
  }
  addComment(card,comment) {
    var options = {
      'method': 'post',
      'headers': {'Accept': 'application/json'}
    };
    let url = `${this.url}/cards/${card.id}/actions/comments?key=${this.key}&token=${this.token}&text=${encodeURIComponent(comment)}`;
    if(url.length > 2000) {
      url = `${this.url}/cards/${card.id}/actions/comments?key=${this.key}&token=${this.token}&text=${encodeURIComponent(truncateString(comment,500))}`;
      Logger.log(`truncating url length to ${url.length}`);
    }
    var result = this.postFunction(options,url);
    return result;
  }
}

function truncateString(commentText, maxLength) {
  if (commentText.length > maxLength) {
    commentText = commentText.substring(0, maxLength);
  }
  return commentText;
}

function TrelloAPITest() {
  this.test_get_card_by_id = function() {
    //GIVEN
    var id = "60446955be3f2d36954663d9";
    var getFunction = function(options,url){
      return JSON.stringify(
        {
          "id":"60446955be3f2d36954663d9",
          "name":"Learn to use github actions",
          "labels":[
            {
              "id":"5f73576d8c515547938c355a",
              "idBoard":"5f73576d8c515547938c3535",
              "name":"Research",
              "color":"orange"
            }
          ]
        }
      );
    };
    var api = new TrelloAPI('key','token',getFunction);

    //WHEN
    var response = api.getCard(id);

    //THEN
    test_assertTrue(response.id == id);
  }
};

function test_trelloAPI(){
  new Test(new TrelloAPITest()).run();
};