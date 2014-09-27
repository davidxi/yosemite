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

_.isElement = function(a) {
    if (typeof HTMLElement !== 'undefined') {
        return a instanceof HTMLElement;
    } else {
        return a &&
               _.has(a, 'nodeType') &&
               a.nodeType === 1;
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

function printf(format/*, param1, param2, ... */) {
    var args = Array.prototype.slice.call(arguments, 0);
    var params = args.map(function(s) {
        if (Object.isUndefined(s) || s === null) {
            return String(s);
        }
        return typeof s === 'object' ? Object.toJSON(s) : String(s);
    });
    var k = 0;
    return format.replace(/%s/g, function() {
        return params[++k];
    });
}

_.invariant = function(condition, format, a, b, c, d, e, f) {
    if (condition) return;
    var message = 'Invariant Violation';
    if (Object.isString(format)) {
        message = printf(message + ': ' + format, a, b, c, d, e, f);
    }
    var error = new Error(message);
    error.framesToPop = 1;
    throw error;
};
