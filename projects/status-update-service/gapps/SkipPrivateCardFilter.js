class SkipPrivateCardFilter {
  constructor(trelloApi){
    this.trelloApi = trelloApi;
  }
  filter(data){
    var cardId = data.content.action.data.card.id;
    var card = this.trelloApi.getCard(cardId);
    var labels = card.labels;
    for(var i = 0; i < labels.length; i++){
      var label = labels[i];
      if ( "Private" == label.name ){
        return null;
      }
    }
    return data;
  }
};

function SkipPrivateCardFilterTest() {
  this.test_filter_private_label = function(){
    //GIVEN
    var trelloAPI = {
      "getCard": function(data){
        return {"labels":[{"name":"Private"}]};
      }
    };
    var filter = new SkipPrivateCardFilter(trelloAPI);
    var data = {"content":{"action":{"data":{"card":{"id":"60446955be3f2d36954663d9"}}}}};

    //WHEN
    var response = filter.filter(data);

    //THEN
    test_assertTrue(response == null);
  }

  this.test_allow_research_label = function(){
    //GIVEN
    var trelloAPI = {
      "getCard": function(data){
        return {"labels":[{"name":"Research"}]};
      }
    };
    var filter = new SkipPrivateCardFilter(trelloAPI);
    var data = {"content":{"action":{"data":{"card":{"id":"60446955be3f2d36954663d9"}}}}};

    //WHEN
    var response = filter.filter(data);

    //THEN
    test_assertTrue(response != null);
  }

  this.test_allow_no_labels = function(){
    //GIVEN
    var trelloAPI = {
      "getCard": function(data){
        return {"labels":[]};
      }
    };
    var filter = new SkipPrivateCardFilter(trelloAPI);
    var data = {"content":{"action":{"data":{"card":{"id":"60446955be3f2d36954663d9"}}}}};

    //WHEN
    var response = filter.filter(data);

    //THEN
    test_assertTrue(response != null);
  }
};

function test_skipprivatecardfilter() {
  new Test(new SkipPrivateCardFilterTest()).run();
}