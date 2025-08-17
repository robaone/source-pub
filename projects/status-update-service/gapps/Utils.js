function mapArrayToHeaders(data,headers){
  var fields = {};
  for(var i = 0; i < headers.length;i++){
    var header = stringToFieldName(headers[i]);
    fields[header] = data[i];
  }
  return fields;
}

function mapToHeaders(fields,headers){
  var map = {};
  var header_map = [];
  for(var i = 0; i < headers.length;i++){
    header_map[i] = stringToFieldName(headers[i]);
  }
  var data = [];
  for(var i = 0; i < headers.length;i++){
    data[i] = fields[header_map[i]] ? fields[header_map[i]] : "";
  }
  return data;
}

function getFieldIndex(fieldname,headers){
  var header_map = [];
  for(var i = 0; i < headers.length;i++){
    var header = headers[i];
    if( header == fieldname ){
      return i;
    }
  }
  return null;
}

function stringToFieldName(str) {
  if(str){
    if(startsWithNumber(str)){
      str = "x"+str;
    }
    str = str.replace(/[^a-zA-Z0-9]/g," ").trim();
    var txt = str.replace(/[^a-zA-Z0-9]/g,"_").toLowerCase();
    return txt;
  }else{
    return "";
  }
}

function startsWithNumber(str){
    var patt = new RegExp("^[0-9].*");
    var res = patt.test(str);
    return res;
}

function getScriptName(){
  return "Utils";
}

function test_stringToFieldName(){
  var str = "This is a test";
  Logger.log(stringToFieldName(str));
  str = "2 This is a test";
  Logger.log(stringToFieldName(str));
}