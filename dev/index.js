var _ = require('lodash');
var Promise = require('bluebird');
var utils = require('./utils');
var helpers = require('./helpers.js');

var tidyaddr = {};

_.forIn(utils,function(value,key){
    tidyaddr[key] = value;
});

module.exports = tidyaddr;
