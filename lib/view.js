/*global APP:false, _ */

APP.componentWillUpdate_ = function(html) {
    APP.componentWillUpdate(APP.container_, html);
    // reset <frameset> structure flag
    APP.hasPagelet = false;
};

APP.componentDidUpdate_ = function(html, reqParams) {
    var container = APP.container_;

    // tear down event listeners from previous page
    container.off('click');
    container.off('contextmenu');
    // flush all loaded css files from previous page
    APP.flushCSS();

    container.find('form').each(function(_, form) {
        // hard to capture inline handler's returnted value, so i overwrite inline handler
        var onSubmitHandler = form.onsubmit;
        form.onsubmit = null;
        $(form).on('submit', function(event) {
            if ($.isFunction(onSubmitHandler) && onSubmitHandler.call(form) === false) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return false;
            }
            return interceptFormSubmit_(event, form);
        });
    });

    container.on('click', 'a, .js-go-uri', function(event) {
        return interceptLinkClick_(event);
    });

    container.on('contextmenu', 'a, .js-go-uri', function(event) {
        return updateRouteURIonLink_(event);
    });

    // restore page anchor
    var pageAnchor = reqParams._hashtag_ && $('#' + reqParams._hashtag_);
    if (pageAnchor && pageAnchor[0]) {
        // let outside developer decide what to do
        APP.componentScrollTop(container, pageAnchor);
    }

    APP.componentDidUpdate(APP.container_, html);
};

APP.componentFailUpdate_ = function(html, reqParams, error) {
    return APP.componentFailUpdate(APP.container_, html, error);
};

/**
 * interceptors
 */
function interceptFormSubmit_(event, form) {
    var container = APP.container_;
    event.stopImmediatePropagation();

    // do nothing if the form submit is prevented by inline onsubmit handler
    if (event.isDefaultPrevented()) return false;

    event.preventDefault();

    var $form = $(form);
    var formSubmitParams = null;
    var formSubmitMethod = form.method;
    if (!formSubmitMethod || /^get$/i.test(formSubmitMethod)) {
        var formData = $form.serialize();
        var formSubmitURI = $form.attr('action');
        APP.goURI(formSubmitURI + '?' + formData);
        return false;
    }

    var xhr = $form.ajaxSubmit({
        debug: APP.verboseMode_,
        url: form.action,
        beforeSerialize: function(form, options) {
            return APP.componentWillSerializeForm(form, options);
        },
        beforeSubmit: function(formData, context, options) {
            var ret = APP.componentWillSubmitForm(formData, form, options);
            formSubmitParams = $.extend({}, formData);
            return ret;
        }
    }).data('jqxhr');
    xhr.done(function(resp) {
        container.empty();
        APP.componentWillUpdate_(container, resp);
        try {
            container.html(resp);
        } catch (e) {
            APP.componentFailUpdate_(resp, e);
            return false;
        }
        APP.goDummyURI(formSubmitParams);
        APP.componentDidUpdate_(container, resp);
    });
    return false;
}

function interceptLinkClick_(event) {
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

    if (APP.regexpJavascriptURI_.test(uri)) return;
    event.preventDefault();

    if (APP.componentWillClickLink(el, uri) === false) return;

    if (/^#/.test(uri)) {
        // page anchor hashtag
        APP.componentScrollTop(el, $(uri));
        return;
    }

    if (!APP.hasPagelet) {
        APP.goURI(uri);
    } else {
        var pageletNode;
        if (el.attr('target')) {
            // link with explicit 'target' prop
            if (/_blank/.test(el.attr('target'))) {
                window.open(uri);
            } else {
                APP.updatePagelet(el.attr('target'), uri);
            }
        } else if ((pageletNode = el.closest('[data-pagelet-id]')), pageletNode[0]) {
            // link inside <form>
            var targetPageletId = pageletNode.attr('data-pagelet-id');
            APP.updatePagelet(targetPageletId, uri);
        }
    }
}

function updateRouteURIonLink_(event) {
    var el = $(event.currentTarget);
    if (!el.is('a')) return;
    var target = el.attr('target'),
        href = el.attr('href');
    if (/^_top$/i.test(target) ||
        /^javascript:/.test(href)) {
        return;
    }
    if (APP.hasPagelet && el.attr('data-external-pagelet')) return;
    if (el.data('yoseHasUpdateLinkURI')) return;
    el.attr('href', APP.facadeURI_(href));
    el.data('yoseHasUpdateLinkURI', true);
}

/**
 * pagelets (used for tranforming <frameset> structure webpage)
 */
APP.hasPagelet = false;
APP.updatePagelet = function(nodeId, url) {
    var container = jQuery('[data-pagelet-id=' + nodeId + ']');
    if (!container.length) {
        // probably target === '_top'
        APP.goOutsideURI(url);
        return false;
    }
    APP.hasPagelet = true;

    var params = {
        url: url
    };
    if (APP.componentWillRoute(params, nodeId) === false) return;

    var req = $.ajax($.extend(params, {
        cache: false
    }));
    req.done(function(html) {
        container.html(html);
        APP.pageletDidUpdate_(container, html, params);
        APP.componentDidUpdate(container, html, nodeId);
    });
};
APP.pageletDidUpdate_ = function(container, html, params) {
    container.find('form').each(function(_, form) {
        var $form = $(form);
        if (form.target && /(_top)|(_blank)/.test(form.target)) {
            return;
        }

        // hard to capture inline handler's returnted value, so i overwrite inline handler
        var onSubmitHandler = form.onsubmit;
        form.onsubmit = null;

        $form.on('submit', function(event) {
            if ($.isFunction(onSubmitHandler) && onSubmitHandler.call(form) === false) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return false;
            }

            event.stopImmediatePropagation();
            event.preventDefault();

            var formSubmitParams = {};
            var req = $form.ajaxSubmit({
                debug: APP.verboseMode_,
                url: form.action,
                beforeSerialize: function(form, options) {
                    return APP.componentWillSerializeForm(form, options);
                },
                beforeSubmit: function(formData, context, options) {
                    var ret = APP.componentWillSubmitForm(formData, form, options);
                    formSubmitParams = $.extend({}, formData);
                    return ret;
                }
            }).data('jqxhr');
            req.done(function(html) {
                // if the form is submit to a different pagelet container
                var targetContainer = $form.attr('target');
                targetContainer && (targetContainer = $('[data-pagelet-id=' + targetContainer + ']'));
                (targetContainer && targetContainer[0]) || (targetContainer = container);

                targetContainer.empty();
                targetContainer.html(html);
                APP.pageletDidUpdate_(targetContainer, html, formSubmitParams);
            });
            return false;
        });
    });

    if (APP.experimentMode_) {
        APP.goDummyURI(params || {});
    }
};

/**
 * callbacks
 */
APP.componentWillUpdate = APP.emptyFunction_;
APP.componentDidUpdate  = APP.emptyFunction_;
APP.componentFailUpdate = APP.emptyFunction_;
APP.componentWillSerializeForm = APP.emptyFunction_;
APP.componentWillSubmitForm = APP.emptyFunction_;
APP.componentWillClickLink  = APP.emptyFunction_;
APP.componentScrollTop = APP.emptyFunction_;

/**
 * view resources management while switching between view context
 */
var CSSBootloader = (function() {

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
        return _.isEmpty(pending);
    }

    function bootstrap_(name, root, onload, onerror) {
        var markNode = document.createElement('meta');
        markNode.id = 'cssbootloader_' + name;
        markNode.style.height = '1px';
        root.appendChild(markNode);
        var hasPending = _.isEmpty(pending);
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
            if (!_.has(registered, name)) return;
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

    return {
        load: load,
        unload: unload
    };
}).call(this);

APP.CSSBootloader = CSSBootloader;
APP.loadCSS = function(name, href, props) {
    return CSSBootloader.load(name, href, props, document.getElementsByTagName('head')[0]);
};
APP.unloadCSS = CSSBootloader.unload;
APP.flushCSS = function() {
    return APP.unloadCSS('*');
};
