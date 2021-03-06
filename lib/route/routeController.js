'use strict';

var $ = require('../vendor/jQuery.js');
var $callbacks = require('../core/callbacks.js');
var $routeParams = require('./routeParamsProvider.js');
var $routeURIUpdater = require('./routeURIUpdater.js');
var $util = require('../core/util.js');
var $viewUpdater = require('../view/viewUpdater.js');

/**
 * route from hash and create ajax request
 */
function route_(params) {
    if (arguments.length === 0) {
        if ($routeURIUpdater.isDummyURI(window.location.hash)) return;
        params = $routeParams(window.location.hash);
    }
    params = params || {};

    var queryUrl = params.url;

    if ($callbacks.componentWillRoute(params) === false || !params) return;

    // delete internal props
    for (var k in params) {
        if (!$util.has(params, k)) continue;
        if (/^_yose_/.test(k)) {
            delete params[k];
        }
    }
    var url = params.url;
    delete params.url;

    var req = $.ajax({
        url: url,
        data: params,
        cache: false
    });
    req.done(function(html) {
        params.url = url;
        params.queryUrl = queryUrl;
        $viewUpdater.updateTransport_($viewUpdater.container_, html, params);
    });
    req.fail(function(xhr, textStatus) {
        params.url = url;
        params.queryUrl = queryUrl;
        $callbacks.componentFailRoute(params, xhr, textStatus);
    });
}

/**
 * register event listener for hash change
 */
function initializeRouter() {
    $(function() {
        $(window).on('hashchange', function() {
            route_();
        });
        var params;
        if (!$routeURIUpdater.isDummyURI(window.location.hash)) {
            params = $routeParams(window.location.hash);
        }
        if ($callbacks.componentWillMount(params) === false) return;
        route_(params);
    });
}

/**
 * exports
 */
module.exports = initializeRouter;
