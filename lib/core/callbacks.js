'use strict';

var $ = require('../vendor/jQuery.js');
var $callbacksPublic = require('./callbacksPublic.js');
var $invariant = require('./invariant.js');
var $typeCheck = require('../core/typeCheck.js');

var Callbacks = {};

/**
 * invoked before route ajax request is created
 */
Callbacks.componentWillRoute = function(reqParams, pageletId) {
    $invariant(!reqParams || $.isPlainObject(reqParams));
    $invariant(!pageletId || $.type('pageletId') === 'string');
    return $callbacksPublic.componentWillRoute(reqParams, pageletId);
};

/**
 * invoked when route ajax request failed
 */
Callbacks.componentFailRoute = function(reqParams, jqXhr, textStatus) {
    $invariant($.isPlainObject(reqParams));
    $invariant($.isPlainObject(jqXhr));
    $invariant($.type(textStatus) === 'string');
    return $callbacksPublic.componentFailRoute(reqParams, jqXhr, textStatus);
};

/**
 * invoked when initial payload before first componentWillRoute()
 */
Callbacks.componentWillMount = function(reqParams) {
    $invariant(!reqParams || $.isPlainObject(reqParams));
    return $callbacksPublic.componentWillMount(reqParams);
};

/**
 * invoked when page will leave current scope.
 * note that when this function is called, it doesn't neccessarily mean the current
 * webpage will be unloaded internally. it is upon the outside callee's decision.
 */
Callbacks.componentWillUnmount = function(jumpUri, eventTarget) {
    $invariant($.type(jumpUri) === 'string');
    $invariant(!eventTarget || eventTarget instanceof $);
    return $callbacksPublic.componentWillUnmount(jumpUri, eventTarget);
};

/**
 * invoked before updating container innerHTML
 */
Callbacks.componentWillUpdate = function(container, contentHtml, pageletId) {
    $invariant(container instanceof $);
    $invariant($.type(contentHtml) === 'string');
    $invariant(!pageletId || $.type(pageletId) === 'string');
    return $callbacksPublic.componentWillUpdate(container, contentHtml, pageletId);
};

/**
 * invoked after updating container innerHTML
 */
Callbacks.componentDidUpdate  = function(container, contentHtml, pageletId) {
    $invariant(container instanceof $);
    $invariant($.type(contentHtml) === 'string');
    $invariant(!pageletId || $.type(pageletId) === 'string');
    return $callbacksPublic.componentDidUpdate(container, contentHtml, pageletId);
};

/**
 * invoked when fail to update container innerHTML
 * (mostly because of js error thrown from inline js code)
 */
Callbacks.componentFailUpdate = function(container, contentHtml, error) {
    $invariant(container instanceof $);
    $invariant($.type(contentHtml) === 'string');
    $invariant(error);
    return $callbacksPublic.componentFailUpdate(container, contentHtml, error);
};

/**
 * proxy jQueryForm::ajaxSubmit::beforeSerialize() callback
 */
Callbacks.componentWillSerializeForm = function(form, options) {
    $invariant(form instanceof $);
    $invariant(!options || $.isPlainObject(options));
    return $callbacksPublic.componentWillSerializeForm(form, options);
};

/**
 * proxy jQueryForm::ajaxSubmit::beforeSubmit() callback
 */
Callbacks.componentWillSubmitForm = function(formData, form, options) {
    $invariant(formData);
    $invariant($typeCheck.isElement(form));
    $invariant(!options || $.isPlainObject(options));
    return $callbacksPublic.componentWillSubmitForm(formData, form, options);
};

/**
 * invoked before link click default behavior is triggered
 */
Callbacks.componentWillClickLink = function(el, uri) {
    $invariant(el instanceof $);
    $invariant($.type(uri) === 'string');
    return $callbacksPublic.componentWillClickLink(el, uri);
};

/**
 * invoked when container will be scrolled to a page anchor
 * (to emulate uri hash default behavior)
 */
Callbacks.componentScrollTop = function(container, pageAnchor) {
    $invariant(container instanceof $);
    $invariant($.type(pageAnchor) === 'string');
    return $callbacksPublic.componentScrollTop(container, pageAnchor);
};

/**
 * exports
 */
module.exports = Callbacks;
