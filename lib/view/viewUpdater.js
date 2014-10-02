'use strict';

var $ = require('../vendor/jQuery.js');
var $callbacks = require('../core/callbacks.js');
var $cssLoader = require('./cssLoader.js');
var $invariant = require('../core/invariant.js');
var $routeUpdater = require('../route/routeURIUpdater.js');
var $typeCheck = require('../core/typeCheck.js');
var $viewInterceptor = require('./viewInterceptor.js');

var ViewUpdater = {};

ViewUpdater.container_ = null; // instance of jQuery

ViewUpdater.updateTransport_ = function(container, html, xhrParams) {
    $typeCheck.isElement(container) && (container = $(container));
    $invariant(container instanceof $);
    $invariant($.type(html) === 'string');
    $invariant(!xhrParams || $.isPlainObject(xhrParams));

    ViewUpdater.componentWillUpdate_(container, html, xhrParams);
    container.empty();
    try {
        container.html(html);
    } catch (e) {
        ViewUpdater.componentFailUpdate_(container, html, xhrParams, e);
        return false;
    }
    ViewUpdater.componentDidUpdate_(container, html, xhrParams);
    return true;
};

ViewUpdater.componentWillUpdate_ = function(container, html) {
    $typeCheck.isElement(container) && (container = $(container));
    $invariant(container instanceof $);
    $invariant($.type(html) === 'string');

    if (container[0] === ViewUpdater.container_[0]) {
        // reset <frameset> structure flag
        ViewUpdater.hasPagelet = false;
    }
    $callbacks.componentWillUpdate(container, html, container.attr('data-pagelet-id'));
};

ViewUpdater.componentDidUpdate_ = function(container, html, reqParams) {
    $invariant(container instanceof $);
    $invariant($.type(html) === 'string');
    $invariant(!reqParams || $.isPlainObject(reqParams));

    // tear down event listeners from previous page
    container.off('click');
    container.off('contextmenu');
    // flush all loaded css files from previous page
    $cssLoader.flushCSS();

    container.find('form').each(function(_, form) {
        if (form.target && /(_top)|(_blank)/.test(form.target)) {
            return;
        }
        $viewInterceptor.attachFormSubmitInterceptor_(ViewUpdater, form, container);
    });

    container.on('click', 'a, .js-go-uri', function(event) {
        return $viewInterceptor.interceptLinkClick_(ViewUpdater, event);
    });

    container.on('contextmenu', 'a, .js-go-uri', function(event) {
        return $viewInterceptor.updateRouteURIonLink_(ViewUpdater, event);
    });

    // restore page anchor
    var pageAnchor = reqParams._hashtag_ && $('#' + reqParams._hashtag_);
    if (pageAnchor && pageAnchor[0]) {
        // let outside developer decide what to do
        $callbacks.componentScrollTop(container, pageAnchor);
    }

    $callbacks.componentDidUpdate(container, html, container.attr('data-pagelet-id'));
};

ViewUpdater.componentFailUpdate_ = function(container, html, xhrParams, error) {
    $typeCheck.isElement(container) && (container = $(container));
    $invariant(container instanceof $);
    $invariant($.type(html) === 'string');
    $invariant(!xhrParams || $.isPlainObject(xhrParams));

    return $callbacks.componentFailUpdate(container, html, error);
};

/**
 * pagelets (used for tranforming <frameset> structure webpage)
 */
ViewUpdater.hasPagelet = false;
ViewUpdater.updatePagelet = function(nodeId, url) {
    var container = $('[data-pagelet-id=' + nodeId + ']');
    if (!container.length) {
        // probably target === '_top'
        $routeUpdater.goOutsideURI(url);
        return false;
    }
    ViewUpdater.hasPagelet = true;

    // tear down root container event listeners (@todo: memoize)
    ViewUpdater.container_.off('click');
    ViewUpdater.container_.off('contextmenu');

    var params = {
        url: url
    };
    if ($callbacks.componentWillRoute(params, nodeId) === false) return;

    var req = $.ajax($.extend(params, {
        cache: false
    }));
    req.done(function(html) {
        ViewUpdater.updateTransport_(container, html, params, nodeId);
    });
};

/**
 * exports
 */
module.exports = ViewUpdater;
