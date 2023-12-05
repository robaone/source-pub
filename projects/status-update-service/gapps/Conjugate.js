function Conjugator(spreadsheet) {
  this.spreadsheet = spreadsheet;
  this.toStatusMessage = function toStatusMessage(title) {
    var conjugated = this.conjugate(this.firstWord(title.trim()));
    if(conjugated.isVerb){
      var message = this.capitalize(conjugated.progressive) + title.substring(conjugated.verb.length);
      return message;
    }else{
      return 'Working on: ' + title;
    }
  };
  this.conjugate = function conjugate(word) {
    var displayValues = this.spreadsheet.getSheetByName('Verbs').getDataRange().getDisplayValues();
    for(var i = 1; i < displayValues.length; i++){
      var conjugation = {
        'verb': displayValues[i][0],
        'progressive': displayValues[i][1],
        'past': displayValues[i][2],
        'isVerb': false
      };
      if(word.toLowerCase() == conjugation.verb){
        conjugation.isVerb = true;
        return conjugation;
      }
    }
    return {
      'isVerb': false
    };
  };
  this.firstWord = function firstWord(sentence){
    var words = sentence.split(' ');
    return words[0];
  };
  this.capitalize = function capitalize(word){
    var capitalizedWord = word[0].toUpperCase() + word.substring(1);
    return capitalizedWord;
  };
};

function ConjugateTests(){
  this.test_capitalize = function test_capitalize(){
    // GIVEN
    var conj = new Conjugator(null);
    var word = 'word';
    
    // WHEN
    var capitalizedWord = conj.capitalize(word);
    
    // THEN
    Assert.match('Word',capitalizedWord);
  };
  this.test_firstWord = function test_firstWord(){
    // GIVEN
    var conj = new Conjugator(null);
    var sentence = 'This is a test';
    
    // WHEN
    var first_word = conj.firstWord(sentence);
    Assert.match('This',first_word);
  };
  this.test_conjugate = function test_conjugate(){
    // GIVEN
    var spreadsheet = {
      'getSheetByName': function(name){
        return {
          'getDataRange': function(){
            return {
              'getDisplayValues': function(){
                return [['Verb','Progressive','Past'],['add','adding','added']];
              }
            };
          }
        };
      }
    };
    var conj = new Conjugator(spreadsheet);
    
    // WHEN
    var conjugation = conj.conjugate('Add');
    
    // THEN
    Assert.isTrue(conjugation.isVerb);
    Assert.match('adding',conjugation.progressive);
    Assert.match('added',conjugation.past);
  };
  this.test_toStatusMessage = function test_toStatusMessage(){
    // GIVEN
    var spreadsheet = {
      'getSheetByName': function(name){
        return {
          'getDataRange': function(){
            return {
              'getDisplayValues': function(){
                return [['Verb','Progressive','Past'],['add','adding','added']];
              }
            };
          }
        };
      }
    };
    var conj = new Conjugator(spreadsheet);
    var title = 'Create status message';
    
    // WHEN
    var message = conj.toStatusMessage(title);
    
    // THEN
    Assert.match('Working on: Create status message',message);
  };
};

function test_conjugate(){
  new Test(new ConjugateTests()).run();
};
