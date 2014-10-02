'use strict';

var $callbacks = require('../core/callbacks.js');
var $util = require('../core/util.js');

/**
 * rewrite hash to invoke route
 */
var goURI = function(url) {
    var hash = url ?
               (/^#!\//.test(url) ? url : ('#!/' + url)) :
               '';

    // rewrite page anchor hashtag, since it conflicts with hashtag routing
    var pageAnchorPos = hash.lastIndexOf('#');
    if (pageAnchorPos > 0) {
        hash = hash.slice(0, pageAnchorPos) +
               (hash.lastIndexOf('?') > -1 ? '&' : '?') +
               '_hashtag_=' + hash.slice(pageAnchorPos + 1);
        return;
    }

    window.location.hash = hash;
};

/**
 * use dummy url to mark page state
 */
var goDummyURI = function(url) {
    return goURI('!' + $util.getHash(url));
};
var isDummyURI = function(url) {
    return /^#!\/!(\d|\w)+/.test(url);
};

/**
 * decorate original url to hash url
 */
var facadeURI = function(url) {
    var isSpecialUri = /^javascript/.test(url);
    return isSpecialUri ? url : ('#!/' + url);
};

/**
 * jump to outside scope (and invoke unmount() before that))
 */
var goOutsideURI = function(uri) {
    uri = uri.toString();
    if ($callbacks.componentWillUnmount(uri) === false) return;
    if (!(/(^https?:\/\/)|(^\/)/).test(uri)) return;
    if (window.location.href === uri) {
        window.location.reload();
    } else
        window.location.href = uri;
};

/**
 * exports
 */
module.exports = {
    facadeURI: facadeURI,
    goDummyURI: goDummyURI,
    goOutsideURI: goOutsideURI,
    goURI: goURI,
    isDummyURI: isDummyURI
};
