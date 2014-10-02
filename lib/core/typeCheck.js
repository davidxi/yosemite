'use strict';

var $util = require('./util.js');

var isEmpty = function(a) {
    if (Array.isArray(a)) {
        return a.length === 0;
    } else if (typeof a === 'object') {
        for (var k in a) {
           if ($util.has(a, k)) return false;
        }
        return true;
    } else {
        return !a;
    }
};

var isElement = function(a) {
    if (typeof HTMLElement !== 'undefined') {
        return a instanceof HTMLElement;
    } else {
        return a &&
               $util.has(a, 'nodeType') &&
               a.nodeType === 1;
    }
};

var isEvent = function(a) {
    return a && a.target;
};

module.exports = {
    isElement: isElement,
    isEmpty: isEmpty,
    isEvent: isEvent
};
