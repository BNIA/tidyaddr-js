var _ = require('lodash');

var subs = {
    "direction":require('./subs/direction.json'),
    "name":require('./subs/name.json'),
    "number":require('./subs/number.json'),
    "suffix":require('./subs/suffix.json'),
    "unit":require('./subs/unit.json')
};

module.exports = subs;

// _.mapValues(subs,function(value){
//     value.sub = _.map(value.sub,function(s){
//         s.match = new RegExp(s.match);
//         return s;
//     });
//     value.ignore = _.map(value.ignore,function(i){
//         return new RegExp(i);
//     });
// });
