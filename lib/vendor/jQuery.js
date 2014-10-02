'use strict';

var $invariant = require('../core/invariant.js');

$invariant(window.jQuery, 'require jQuery plugin');
$invariant(window.jQuery.fn.ajaxSubmit, 'require jquery.form plugin');

module.exports = window.jQuery;
