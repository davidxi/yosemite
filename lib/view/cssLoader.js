'use strict';

var $ = require('../vendor/jQuery.js');
var $typeCheck = require('../core/typeCheck.js');
var $util = require('../core/util.js');

var registered = {};
var pending = {};
var canAddCSSLink;
var inlineStyles = [];

var $$detect_ = false;
var detect_ = function(root) {
    if ($$detect_) return;
    $$detect_ = true; // _.once()
    var link = document.createElement('link');
    link.onload = function() {
        canAddCSSLink = true;
        link.parentNode.removeChild(link);
    };
    link.rel = 'stylesheet';
    link.href = 'data:text/javascript;base64,I2dvLWdyZWF0LWRhbmVzIHsNCn0=';
    root.appendChild(link);
};

function inquery_() {
    var callbacks = [];
    var markNodes = [];
    for (var name in pending) {
        var markNode = pending[name].signal;
        var dummy = window.getComputedStyle ?
                    window.getComputedStyle(markNode, null) :
                    markNode.currentStyle;
        if (dummy && parseInt(dummy.height, 10) > 0) {
            callbacks.push(pending[name].load);
            markNodes.push(pending[name].signal);
            delete pending[name];
        }
    }
    var i, i0;
    for (i = 0, i0 = markNodes.length; i < i0; i++) {
        markNodes[i].parentNode.removeChild(markNodes[i]);
    }
    for (i = 0, i0 = callbacks.length; i < i0; i++) {
        callbacks[i] && callbacks[i]();
    }
    return $typeCheck.isEmpty(pending);
}

function bootstrap_(name, root, onload, onerror) {
    var markNode = document.createElement('meta');
    markNode.id = 'cssbootloader_' + name;
    markNode.style.height = '1px';
    root.appendChild(markNode);
    var hasPending = $typeCheck.isEmpty(pending);
    pending[name] = {
        error: onerror,
        load: onload,
        signal: markNode
    };
    if (hasPending) return;
    var interval = window.setInterval(function() {
        if (inquery_()) {
            window.clearInterval(interval);
        }
    }, 50);
}

function load(name, uri, options, root, onload, onerror) {
    if (registered[name]) return;

    if (('createStyleSheet' in document) && !(options && options.media)) {
        var availableSlot = null;
        for (var i = 0, i0 = inlineStyles.length; i < i0; i++) {
            if (inlineStyles[i].imports.length <= 30) {
                availableSlot = i;
                break;
            }
        }
        if (availableSlot === null) {
            try {
                availableSlot = inlineStyles.push(document.createStyleSheet()) - 1;
            } catch (e) {
                onerror(e);
                return;
            }
        }
        inlineStyles[availableSlot].addImport(uri);
        registered[name] = {
            uri : uri,
            styleSheet: inlineStyles[availableSlot]
        };
        bootstrap_(name, root, onload, onerror);
    } else {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = uri;
        link = $.extend(link, (options || {}));
        registered[name] = {
            link : link
        };
        if (canAddCSSLink) {
            link.onload = function() {
                link.onload = null;
                link.onerror = null;
            };
            link.onerror = function() {
                this.onload =  null;
                this.onerror = null;
                onerror && onerror();
            };
        } else {
            bootstrap_(name, root, onload, onerror);
            (Object.isUndefined(canAddCSSLink)) && detect_(root);
        }
        root.appendChild(link);
    }
}

function unload(name) {
    if (name === '*') {
        for (var k in registered) {
            teardown_(k);
        }
    } else {
        teardown_(name);
    }

    function teardown_(name) {
        if (!$util.has(registered, name)) return;
        var resource = registered[name];
        if (resource.link) {
            resource = resource.link;
            resource.onload = resource.onerror = null;
            resource.parentNode.removeChild(resource);
        } else {
            var inlineStyle = resource.styleSheet;
            for (var i = 0, i0 = inlineStyle.imports.length; i < i0; i++) {
                if (inlineStyle.imports[i].href === resource.uri) {
                    inlineStyle.removeImport(i);
                    break;
                }
            }
        }
        delete registered[name];
        delete pending[name];
    }
}

module.exports = {
    loadCSS: function(name, href, props) {
        return load(name, href, props, document.getElementsByTagName('head')[0]);
    },
    unloadCSS: function(name) {
        return unload(name);
    },
    flushCSS: function() {
        return unload('*');
    }
};
