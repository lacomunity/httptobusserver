var Map = function() {

};

Map.prototype.set = function(key, value) {
    this[key] = value;
};

Map.prototype.get = function(key) {
    return this[key];
};

Map.prototype.delete = function(key) {
    delete this[key];
};

module.exports = Map;
