var tidyaddr = require('./dev/index.js');
var helpers = require('./dev/helpers.js');
var arguments = process.argv.slice(2);
var _ = require('lodash');

if(arguments[0] === "clean-csv"){
	var infile = arguments[1];
	var outfile = arguments[2];
	if(!infile || !outfile){
		console.log("no input or output provided!");
		process.exit(0);
	}
	else{
		helpers.readCsv(infile).then(function(csv_records){
			// Reads in the CSV as an Object Array
			var addresses = _.pluck(csv_records,"address");
			var cleaned = tidyaddr.cleanLines(addresses);
			var a = fullJoin(csv_records, cleaned);
			return a;
		})
		.then(function(results){
			return helpers.writeCsv(results,outfile);
		})
		.then(function(){
			console.log("DONE");
		})
	}
}

function fullJoin(a, b) {
  var r = [];
  a.forEach(function (a) {
    var found = false;
    b.forEach(function (b) {
      if (a.address === b.original) {
        var j = Object.assign(a, b);
        r.push(j);
        found = true;
      }
    })
    if (!found) r.push(a);
  });
  b.forEach(function (b) {
    var found = false;
    a.forEach(function (a) {
       if (a.address === b.original) found = true;
    });
    if (!found) r.push(b);
  });
  return r;
}
