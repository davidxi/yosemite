'use strict';

var $ = require('./vendor/jQuery.js');
var $invariant = require('./core/invariant.js');
var $initializeRoute = require('./route/routeController.js');
var $viewUpdater = require('./view/viewUpdater.js');

var APP = window.Yosemite = {};

APP.initBeacon = $.Deferred();

APP.init = function(node) {
    $viewUpdater.container_ = $(node);
    $invariant($viewUpdater.container_.length, 'no container found');

    APP.initBeacon.resolve();
};

$.when(APP.initBeacon).done(function() {
    $initializeRoute();
});

$.extend(APP, require('./route/routeURIUpdater.js'));
$.extend(APP, require('./view/cssLoader.js'));
$.extend(APP, require('./view/viewUpdater.js'));

module.exports = APP;
