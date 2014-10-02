'use strict';

var $ = require('../vendor/jQuery.js');

function wrapper(name) {
    return function() {
        var args = Array.prototype.slice.call(arguments, 0);
        return window.Yosemite && $.isFunction(window.Yosemite[name]) ?
                window.Yosemite[name].apply(window.Yosemite, args) :
                $.noop();
    };
}

module.exports = {
    // route
    componentWillRoute: wrapper('componentWillRoute'),
    componentFailRoute: wrapper('componentFailRoute'),
    componentWillMount: wrapper('componentWillMount'),
    componentWillUnmount: wrapper('componentWillUnmount'),
    // view
    componentWillUpdate: wrapper('componentWillUpdate'),
    componentDidUpdate: wrapper('componentDidUpdate'),
    componentFailUpdate: wrapper('componentFailUpdate'),
    componentWillSerializeForm: wrapper('componentWillSerializeForm'),
    componentWillSubmitForm: wrapper('componentWillSubmitForm'),
    componentWillClickLink: wrapper('componentWillClickLink'),
    componentScrollTop: wrapper('componentScrollTop')
};
