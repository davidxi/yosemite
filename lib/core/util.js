'use strict';

var $ = require('../vendor/jQuery.js');
var $invariant = require('../core/invariant.js');
var $JsSHA = require('../vendor/sha1.js');

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
    return (new $JsSHA(str, 'TEXT')).getHash('SHA-1', 'HEX');
};

var camelize = function(string) {
    return string.replace(/-(.)/g, function(_, character) {
        return character.toUpperCase();
    });
};

var hyphenate = function(string) {
    return string.replace(/([A-Z])/g, '-$1').toLowerCase();
};

var markStateOnNode = function(node, key, val) {
    $invariant(node instanceof $);
    node.data(('yosemite.' + key), val);
    node.attr(('data-yosemite-' + hyphenate(key)), val);
};

var getStateOnNode = function(node, key) {
    $invariant(node instanceof $);
    return node.data('yosemite.' + key);
};

module.exports = {
    camelize: camelize,
    has: has,
    hyphenate: hyphenate,
    getHash: getHash,
    getStateOnNode: getStateOnNode,
    getUid: getUid,
    markStateOnNode: markStateOnNode
};
