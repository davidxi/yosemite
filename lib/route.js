/*global APP:false, _ */

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
        $.each(pairs, function(_, pair) {
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
APP.goDummyURI = function(url) {
    return APP.goURI('!' + _.getHash(url));
};
APP.isDummyURI = function(url) {
    return /^#!\/!(\d|\w)+/.test(url);
};

APP.facadeURI_ = function(url) {
    if (APP.regexpJavascriptURI_.test(url)) return url;
    return ('#!/' + url);
};

APP.goOutsideURI = function(uri) {
    uri = uri.toString();
    if (APP.componentWillUnmount(uri) === false) return;
    if (!(/(^https?:\/\/)|(^\/)/).test(uri)) return;
    if (window.location.href === uri) {
        window.location.reload();
    } else
        window.location.href = uri;
};

function route_(params) {
    if (arguments.length === 0) {
        if (APP.isDummyURI(window.location.hash)) return;
        params = APP.routeParams_(window.location.hash);
    }
    if (APP.componentWillRoute(params) === false || !params) return;

    var url = params.url;
    delete params.url;

    var req = $.ajax({
        url: url,
        data: params,
        cache: false
    });
    req.done(function(html) {
        APP.componentWillUpdate_(html, params);
        try {
            APP.container_.html(html);
        } catch (e) {
            APP.componentFailUpdate_(html, params, e);
            return;
        }
        APP.componentDidUpdate_(html, params);
    });
    req.fail(function(xhr, textStatus) {
        APP.componentFailRoute(params, xhr, textStatus);
    });
}


$.when(APP.initBeacon).done(function() {
    $(function() {
        $(window).on('hashchange', function() {
            route_();
        });
        var params;
        if (!APP.isDummyURI(window.location.hash)) {
            params = APP.routeParams_(window.location.hash);
        }
        if (APP.componentWillMount(params) === false) return;
        route_(params);
    });
});

/**
 * callbacks
 */
APP.componentWillRoute = APP.emptyFunction_;
APP.componentFailRoute = APP.emptyFunction_;
APP.componentWillMount = APP.emptyFunction_;
APP.componentWillUnmount = APP.emptyFunction_;
