
var APP = window.Yosemite = {};
/* jshint ignore:start */
var $ = window.jQuery;
/* jshint ignore:end */

APP.verboseMode_ = true;

APP.emptyFunction_ = function() {};
APP.identityFunction_ = function(a) {return a;};

APP.regexpJavascriptURI_ = /^javascript/;

APP.initBeacon = $.Deferred();

APP.init = function(node) {
    if (!window.jQuery) throw new Error('require jQuery plugin');
    if (!jQuery.fn.ajaxSubmit) throw new Error('require jquery.form plugin');

    APP.container_ = jQuery(node);

    APP.initBeacon.resolve();
};
