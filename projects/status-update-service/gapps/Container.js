function Container() {
  this._map = {};
  this.register = function(name,containerObject){
    this._map[name] = containerObject;
  }
  this.get = function(name){
    return this._map[name];
  }
}
