'use strict';

var jsSHA = require('../vendor/sha1.js');

var has = function(a, b) {
    return Object.prototype.hasOwnProperty.call(a, b);
};

var getUid = (function() {
    var counter = 0;
    return function() {
        return ++counter;
    };
})();

var getHash = function(a) {
    if (typeof a === 'object') {
        a = JSON.stringify(a);
    }
    var suffix = '<ts>' + (+new Date()) + '</ts>';
    var str = 'blob ' + a.length + '\0' + a + suffix;
    return (new jsSHA(str, 'TEXT')).getHash('SHA-1', 'HEX');
};

module.exports = {
    has: has,
    getHash: getHash,
    getUid: getUid
};
