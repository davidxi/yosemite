'use strict';

var $ = require('../vendor/jQuery.js');

var digitTest = /^\d+$/,
    keyBreaker = /([^\[\]]+)|(\[\])/g,
    paramTest = /([^?#]*)(#.*)?$/,
    prep = function (str) {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    };

var RouteParamsProvider = function(params) {
    var data = {},
        pairs, lastPart;
    if (!params || !paramTest.test(params)) return;
    params = params.replace(/^#[!\/]*/, '');
    pairs = params.split('?');
    data.url = pairs.shift();
    pairs = pairs.shift() || '';
    pairs = pairs.split('&');
    $.each(pairs, function(_, pair) {
        var parts = pair.split('='),
        key = prep(parts.shift()),
        value = prep(parts.join('=')),
        current = data;
        if (!key) return;
        parts = key.match(keyBreaker);
        for (var j = 0, j0 = parts.length - 1; j < j0; j++) {
            current[parts[j]] || (current[parts[j]] = digitTest.test(parts[j + 1]) || parts[j + 1] === '[]' ? [] : {});
            current = current[parts[j]];
        }
        lastPart = parts.pop();
        if (lastPart === '[]') {
            current.push(value);
        } else {
            current[lastPart] = value;
        }
    });
    return data;
};

module.exports = RouteParamsProvider;
