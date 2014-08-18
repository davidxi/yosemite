/*global jsSHA */

var _ = {};

_.has = function(a, b) {
    return Object.prototype.hasOwnProperty.call(a, b);
};

_.isEmpty = function(a) {
    if (Array.isArray(a)) {
        return a.length === 0;
    } else if (typeof a === 'object') {
        for (var k in a) {
           if (_.has(a, k)) return false;
        }
        return true;
    } else {
        return !a;
    }
};

_.getHash = function(a) {
    if (typeof a === 'object') {
        a = JSON.stringify(a);
    }
    var suffix = '<ts>' + (+new Date()) + '</ts>';
    var str = 'blob ' + a.length + '\0' + a + suffix;
    return (new jsSHA(str, 'TEXT')).getHash('SHA-1', 'HEX');
};
