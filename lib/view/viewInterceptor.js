'use strict';

var $ = require('../vendor/jQuery.js');
var $callbacks = require('../core/callbacks.js');
var $invariant = require('../core/invariant.js');
var $routeUpdater = require('../route/routeURIUpdater.js');
var $typeCheck = require('../core/typeCheck.js');
var $util = require('../core/util.js');

var Interceptors = {};

// can't require('viewUpdater') since it will leads to circular dependency;
// so, just always pass 'viewUpdater' as 1st argument in run-time.

Interceptors.attachFormSubmitInterceptor_ = function(viewUpdater, form, componentContainer) {
    $invariant(viewUpdater.container_ instanceof $);
    $invariant($typeCheck.isElement(form) && (form.tagName.toUpperCase() === 'FORM'));
    $invariant(componentContainer instanceof $);

    // hard to capture inline handler's returnted value, so i overwrite inline handler
    var onSubmitHandler = form.onsubmit;
    form.onsubmit = null;
    $(form).on('submit', function(event) {
        if ($.isFunction(onSubmitHandler) && onSubmitHandler.call(form) === false) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return false;
        }
        return interceptFormSubmit_(viewUpdater, event, form, componentContainer);
    });
};

/**
 * response to form submit behavior
 */
function interceptFormSubmit_(viewUpdater, event, form, componentContainer, xhrDoneCb) {
    $invariant(viewUpdater.container_ instanceof $);
    $invariant($typeCheck.isEvent(event));
    $invariant($typeCheck.isElement(form) && (form.tagName.toUpperCase() === 'FORM'));
    $invariant(componentContainer instanceof $);
    $invariant(!xhrDoneCb || $.isFunction(xhrDoneCb));

    event.stopImmediatePropagation();

    if (event.isDefaultPrevented()) return false;

    event.preventDefault();

    var $form = $(form);
    var formSubmitMethod = form.method;

    if (form.target && /(_top)|(_blank)/.test(form.target)) {
        $callbacks.componentWillUnmount($form.attr('action'), $form);
        return false;
    }

    if (!viewUpdater.hasPagelet) {
        if (!formSubmitMethod || /^get$/i.test(formSubmitMethod)) {
            var formData = $form.serialize();
            var formSubmitURI = $form.attr('action');
            formSubmitURI = viewUpdater.getRelativeUrlFromCurrentView(formSubmitURI);
            $routeUpdater.goURI(formSubmitURI + '?' + formData);
            return false;
        }
    }

    var formSubmitParams = null;

    var xhr = $form.ajaxSubmit({
        debug: true,
        url: form.action,
        beforeSerialize: function(form, options) {
            return $callbacks.componentWillSerializeForm(form, options);
        },
        beforeSubmit: function(formData, context, options) {
            var ret = $callbacks.componentWillSubmitForm(formData, form, options);
            formSubmitParams = $.extend({}, formData);
            return ret;
        }
    }).data('jqxhr');

    // xhr is not created if ajax request is stopped in before..() callbacks
    if (!xhr || !$.isFunction(xhr.done)) return false;

    xhr.done(function(resp) {
        var targetContainer = componentContainer;

        if (viewUpdater.hasPagelet) {
            // if the form is submit to a different pagelet container
            var targetContainerId = $form.attr('target');
            targetContainerId && (targetContainer = $('[data-pagelet-id=' + targetContainerId + ']'));
            $invariant(targetContainer && targetContainer[0]);
        }

        formSubmitParams.url = form.action;

        var ret = viewUpdater.updateTransport_(targetContainer, resp, formSubmitParams);
        if (!ret) return;
        viewUpdater.hasPagelet || $routeUpdater.goDummyURI(formSubmitParams);
        viewUpdater.componentDidUpdate_(targetContainer, resp, formSubmitParams);
    });
    return false;
}

/**
 * response to link click bahavoir
 */
Interceptors.interceptLinkClick_ = function(viewUpdater, event) {
    $invariant(viewUpdater.container_ instanceof $);
    $invariant($typeCheck.isEvent(event));

    event.stopImmediatePropagation();
    var el = $(event.currentTarget);

    var confirm = el.attr('data-confirm-onclick');
    if (confirm) {
        confirm = window.confirm(confirm);
        if (!confirm) {
            event.preventDefault();
            return false;
        }
    }

    var uri = el.is('a') ? el.attr('href') : el.attr('data-go-uri');

    if (/^javascript/.test(uri)) return;
    event.preventDefault();

    if ($callbacks.componentWillClickLink(el, uri) === false) return;

    if (/^#/.test(uri) && !/#!/.test(uri)) {
        // page anchor hashtag
        $callbacks.componentScrollTop(el, $(uri));
        return;
    }

    var _target = el.attr('target');

    if (!viewUpdater.hasPagelet) {
        var relativeURL = viewUpdater.getRelativeUrlFromCurrentView(uri);
        if (_target && '_top' === _target) {
            $routeUpdater.goOutsideURI(relativeURL);
        } else if (_target && '_blank' === _target) {
            window.open(relativeURL);
        } else {
            $routeUpdater.goURI(relativeURL);
        }
    } else {
        var pageletNode;
        if (_target) {
            // link with explicit 'target' prop
            if ('_blank' === _target) {
                window.open(uri);
            } else {
                viewUpdater.updatePagelet(_target, uri);
            }
        } else if ((pageletNode = el.closest('[data-pagelet-id]')), pageletNode[0]) {
            // link inside <form>
            var targetPageletId = pageletNode.attr('data-pagelet-id');
            viewUpdater.updatePagelet(targetPageletId, uri);
        }
    }
};

/**
 * response to link context-menu behavior
 */
Interceptors.updateRouteURIonLink_ = function(viewUpdater, event) {
    $invariant(viewUpdater.container_ instanceof $);
    $invariant($typeCheck.isEvent(event));

    var el = $(event.currentTarget);
    if (!el.is('a')) return;
    var target = el.attr('target'),
        href = el.attr('href');
    if (/^_top$/i.test(target) ||
        /^javascript:/.test(href)) {
        return;
    }
    if (viewUpdater.hasPagelet) return;
    if ($util.getStateOnNode(el, 'hasUpdateLinkURI')) return;

    var relativeURL = viewUpdater.getRelativeUrlFromCurrentView(href);
    el.attr('href', $routeUpdater.facadeURI(relativeURL));
    $util.markStateOnNode(el, 'hasUpdateLinkURI', true);
};

/**
 * exports
 */
module.exports = Interceptors;
