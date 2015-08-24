var _ = require('lodash');
var Promise = require('bluebird');
var subs = require('./subs.js');
var helpers = require('./helpers.js');

exports.cleanLine = function(line){
  var results = {number:null,direction:null,name:null,suffix:null,unit:null,original:null,tidyaddress:null};
  results.original = line;

  //suffix
  var sfxSubObjs = helpers.mapSub(line,subs.suffix.sub);
  var sfxIgnoreObjs = helpers.mapSub(line,subs.suffix.ignore);
  sfxSubObjs = helpers.removeIgnoredSubObjs(sfxSubObjs,sfxIgnoreObjs);
  sfxSubObjs = helpers.filterRightmostLeftIndex(sfxSubObjs);
  sfxSubObjs = helpers.filterLongest(sfxSubObjs);
  if(sfxSubObjs.length === 0){return results;}
  var sfxSubObj = sfxSubObjs[0];
  results.suffix = sfxSubObj.replace;

  //number
  var numSubObjs = helpers.mapSub(line, subs.number.sub);
  numSubObjs = helpers.filterLeftmostLeftIndex(numSubObjs);
  numSubObjs = helpers.filterLongest(numSubObjs);
  if(numSubObjs.length === 0){return results;}
  var numSubObj = numSubObjs[0];
  results.number = numSubObj.replace;

  //direction
  var dirSubObjs = helpers.mapSub(line, subs.direction.sub);
  var dirIgnoreObjs = helpers.mapSub(line, subs.direction.ignore);
  dirSubObjs = helpers.removeIgnoredSubObjs(dirSubObjs, dirIgnoreObjs);
  dirSubObjs = helpers.filterOutside(sfxSubObj.start,sfxSubObj.end,dirSubObjs);
  dirSubObjs = helpers.filterLeftmostLeftIndex(dirSubObjs);
  dirSubObjs = helpers.filterLongest(dirSubObjs);

  var dirSubObj = null;
  if(dirSubObjs.length > 0){
    dirSubObj = dirSubObjs[0];
    results.direction = dirSubObj.replace;
  }
  var name = null;
  var unit = null;
  if(dirSubObj !== null && helpers.subObjLeftOfSubObj(dirSubObj,sfxSubObj)){
    name = helpers.subStringBetweenSubObjs(line,dirSubObj,sfxSubObj);
    unit = helpers.subStringRightOfSubObj(line,sfxSubObj);
  }
  else if (dirSubObj !== null && helpers.subObjRightOfSubObj(dirSubObj,sfxSubObj)){
    name = helpers.subStringBetweenSubObjs(line,numSubObj,sfxSubObj);
    unit = helpers.subStringRightOfSubObj(line,dirSubObj);
  }
  else{
    name = helpers.subStringBetweenSubObjs(line,numSubObj,sfxSubObj);
    unit = helpers.subStringRightOfSubObj(line,sfxSubObj);
  }
  name = helpers.stripString(name);
  name = name.toLowerCase();
  if (unit === ''){
    unit = null;
  }
  else{
    unit = helpers.stripString(unit);
    unit = unit.toLowerCase();
  }
  results.name = name;
  results.unit = unit;

  var tidyaddress = helpers.cleanConcat([results.number,results.direction,results.name,results.suffix]);
  results.tidyaddress = tidyaddress;
  return results;

};