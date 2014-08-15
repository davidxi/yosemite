/*global APP:false*/

APP.routeParams_ = (function() {
    var digitTest = /^\d+$/,
        keyBreaker = /([^\[\]]+)|(\[\])/g,
        paramTest = /([^?#]*)(#.*)?$/,
        prep = function (str) {
            return decodeURIComponent(str.replace(/\+/g, ' '));
        };
    return function RouteParamsProvider(params) {
        var data = {},
            pairs, lastPart;
        if (!params || !paramTest.test(params)) return;
        params = params.replace(/^#[!\/]*/, '');
        pairs = params.split('?');
        data.url = pairs.shift();
        pairs = pairs.shift() || '';
        pairs = pairs.split('&');
        pairs.each(function (pair) {
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
})();

APP.goURI = function(url) {
    var hash = url ?
               (/^#!\//.test(url) ? url : ('#!/' + url)) :
               '';
    window.location.hash = hash;
};

APP.facadeURI_ = function(url) {
    if (APP.regexpJavascriptURI_.test(url)) return url;
    return ('#!/' + url);
};

function route_() {
    if (/^#!\/!(\d|\w)+/.test(window.location.hash)) return;

    var params;
    try {
        params = APP.routeParams_(window.location.hash);
    } catch (e) {
        params = null;
    }
    if (APP.componentWillRoute(params) === false || !params) return;

    var url = params.url;
    delete params.url;

    var req = jQuery.ajax({
        url: url,
        data: params
    });
    req.done(function(html) {
        APP.componentWillUpdate_(html);
        try {
            APP.container_.html(html);
        } catch (e) {
            APP.componentFailUpdate_(html, e);
            return;
        }
        APP.componentDidUpdate_(html);
    });
    req.fail(function(xhr, textStatus) {
        APP.componentFailRoute(params, xhr, textStatus);
    });
}

jQuery(window).on('hashchange', route_);
jQuery(route_);

/**
 * callbacks
 */
APP.componentWillRoute = APP.emptyFunction_;
APP.componentFailRoute = APP.emptyFunction_;
