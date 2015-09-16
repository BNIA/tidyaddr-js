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
		helpers.readCsv(infile).then(function(lines){
			lines = _.pluck(lines,"address");
			return tidyaddr.cleanLines(lines);
		})
		.then(function(results){
			return helpers.writeCsv(results,outfile);
		})
		.then(function(){
			console.log("DONE");
		})
	}
}