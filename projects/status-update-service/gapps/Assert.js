var Assert = {
  'isTrue': function(value){
    if(value != true){
     throw 'Value is not true';
    }
  },
  'match': function(expected,actual){
    if(expected != actual){
      throw 'Expected value is (' + expected + ') but is (' + actual + ')';
    }
  }
};
