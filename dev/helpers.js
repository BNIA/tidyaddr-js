var _ = require('lodash');
var Promise = require('bluebird');
var XRegExp = require('xregexp').XRegExp;
_.merge(XRegExp, require('xregexp-lookbehind'));

var getSubObj = function(match,matchStr,replaceStr){
    var subObj = {};
    subObj.found = match[0];
    subObj.start = match.index;
    subObj.len = subObj.found.length;
    subObj.end = subObj.start + subObj.len;
    subObj.match = matchStr;
    subObj.replace = (replaceStr === undefined || replaceStr === null ? subObj.found : replaceStr);
    if(subObj.replace === ''){subObj.replace = null}
    subObj.original = match.input;
    subObj.originalLen = subObj.original.length;
    subObj.subbed = (replaceStr === undefined || replaceStr === null ? subObj.original : replaceBetween(subObj.original,subObj.replace,subObj.start,subObj.end));
    subObj.subbedLen = subObj.subbed.length;
    return subObj;
};

var replaceBetween = function(str,replaceStr,start,end){
    var left = str.substring(0,start);
    var right = str.substring(end+1,str.length);
    return left + replaceStr + right;
};

exports.stripUnwantedCharacters = function(str){
  if(str === null){return null;}
  return str.replace('.',' ')
    .replace('\'',' ')
    .replace('"',' ')
    .replace('_',' ')
    .replace('#',' ')
    .replace('`',' ')
}

exports.whiteSpace = function(str){
  return XRegExp.test(str,/^\s*$/);
};

exports.longestStr = function(strArr) {

};

exports.matchReplace = function(str, matchRegEx, replaceStr) {
    var matched = str.match(matchRegEx);
    if (matched === null) {
        return null;
    }
    else{

    }

};

exports.findAllSub = function(str,matchStr,replaceStr,opts){
    opts = _.assign({},{'flags':''},opts);

    var results = [];
    var pos = 0;
    var match;
    if(opts.lookbehind){
      var substr = str;
      //not sure if correct
      while((match = XRegExp.execLb(substr,matchStr[0],XRegExp(matchStr[1],opts.flags)))){
          var oldpos = pos;
          //match.index+=1; //this is dumb
          pos = pos + match.index + match[0].length;
          substr = substr.substring(pos,str.length);
          match.index = oldpos+match.index;
          var result = getSubObj(match,matchStr,replaceStr);
          results.push(result);
      }
    }
    else{
      while((match = XRegExp.exec(str,XRegExp(matchStr,opts.flags),pos))){
          var result = getSubObj(match,matchStr,replaceStr);
          pos = match.index + match[0].length;
          results.push(result);
      }
    }
    return results;
};

exports.mapSub = function(line, sub){
    var mapped =  _.map(sub,function(s){
        return exports.findAllSub(line,s.match,s.replace,s.opts);
    });
    var flattened = _.flattenDeep(mapped);
    return _.uniq(flattened);
};

exports.reduceReplaceOnly = function(line, replaceOnly){
  var replace = _.reduce(replaceOnly,function(finalStr,r){
    var re = new RegExp(r.match,r.opts.flags);
    finalStr = finalStr.replace(re,r.replace);
    return finalStr;
  },line);
  return replace;
};

exports.removeIgnoredSubObjs = function(subObjs,ignores){
  console.log("subObjs");
    return _.filter(subObjs,function(s){
      return !_.some(ignores,{found:s.found,start:s.start,end:s.end});
    });
};

exports.filterLeftmostLeftIndex = function(subObjs){
  if(subObjs.length === 0 ){return subObjs;}
  var sorted = _.sortBy(subObjs, function(s){
    return s.start;
  });
  return _.where(sorted,{start:sorted[0].start});
};

exports.filterLeftmostRightIndex = function(subObjs){
  if(subObjs.length === 0 ){return subObjs;}
  var sorted = _.sortBy(subObjs, function(s){
    return s.end;
  });
  return _.where(sorted,{start:sorted[0].end});
};

exports.filterRightmostLeftIndex = function(subObjs){
  if(subObjs.length === 0 ){return subObjs;}
  var sorted = _.sortBy(subObjs, function(s){
    return s.start;
  });
  return _.where(sorted,{start:_.last(sorted).start});
};

exports.filterRightMostRightIndex = function(subObjs){
  if(subObjs.length === 0 ){return subObjs;}
  var sorted = _.sortBy(subObjs, function(s){
    return s.end;
  });
  return _.where(sorted,{start:_.last(sorted).end});
};

exports.filterShortest = function(subObjs){
  if(subObjs.length === 0 ){return subObjs;}
  var sorted = _.sortBy(subObjs, function(s){
    return s.len;
  });
  return _.where(sorted,{len:sorted[0].len});
};

exports.filterLongest = function(subObjs){
  if(subObjs.length === 0 ){return subObjs;}
  var sorted = _.sortBy(subObjs, function(s){
    return s.len;
  });
  return _.where(sorted,{len:_.last(sorted).len});
};

exports.filterLeftOf = function(index,subObjs,inclusive){
  if(subObjs.length === 0 ){return subObjs;}
  return _.filter(subObjs, function(s){
    if(inclusive === undefined || inclusive === false){
      return s.end < index;
    }
    else return s.end <= index;
  });
};

exports.filterRightOf = function(index,subObjs,inclusive){
  if(subObjs.length === 0 ){return subObjs;}
  return _.filter(subObjs, function(s){
    if(inclusive === undefined || inclusive === false){
      return s.start > index;
    }
    else return s.start >= index;
  });

};

exports.filterBetween = function(leftIndex,rightIndex,subObjs,leftInclusive,rightInclusive){
  if(subObjs.length === 0 ){return subObjs;}
  var rightOf = exports.filterRighttOf(leftIndex,subObjs,leftInclusive);
  var leftOf = exports.filterLeftOf(rightIndex,subObjs,rightInclusive);
  return _.intersection(rightOf,leftOf);
};

exports.filterOutside = function(leftIndex,rightIndex,subObjs,leftInclusive,rightInclusive){
  if(subObjs.length === 0 ){return subObjs;}
  var leftOf = exports.filterLeftOf(leftIndex,subObjs,leftInclusive);
  var rightOf = exports.filterRightOf(rightIndex,subObjs,rightInclusive);
  return _.union(leftOf,rightOf);
};

exports.subObjLeftOfSubObj = function(subObj1,subObj2,inclusive){
  if(inclusive === undefined || inclusive === false){
    return subObj1.end < subObj2.start;
  }
  return subObj1.end <= subObj2.start;
};

exports.subObjRightOfSubObj = function(subObj1,subObj2,inclusive){
  if(inclusive === undefined || inclusive === false){
    return subObj1.start > subObj2.end;
  }
  return subObj1.start >= subObj2.end;
};

exports.subStringBetweenSubObjs = function(str,leftSubObj,rightSubObj,leftInclusive,rightInclusive){
  var leftIndex, rightIndex;
  if(leftInclusive === undefined || leftInclusive === false){
    leftIndex = leftSubObj.end+1;
  }
  else{
    leftIndex = leftSubObj.end;
  }
  if(rightInclusive === undefined || rightInclusive === false){
    rightIndex = rightSubObj.start-1;
  }
  else{
    rightIndex = rightSubObj.start;
  }
  return str.substring(leftIndex,rightIndex);
};

exports.subStringRightOfSubObj = function(str,subObj,inclusive){
  if(inclusive === undefined || inclusive === false){
    return str.substring(subObj.end+1,str.length);
  }
  else return str.substring(subObj.end,str.length);
};

exports.subStringLeftOfSubObj = function(str,subObj){
  return str.substring(0,subObj.start-1);
};

exports.stripString = function(str){
  var trimmed = _.trim(str);
  return trimmed.replace(/ +(?= )/g,'');
}

exports.cleanConcat = function(strArr){
  var concatted = _.reduce(strArr, function(result, s){
    if(s === null){
      result+='';
    }
    else{
      result+= s +' ';
    }
    return result;
  },'');
  return exports.stripString(concatted);
}

exports.removeHeadZeroes = function(str){
  return str.replace(/^0*/,'');
}
