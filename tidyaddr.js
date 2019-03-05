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
			// var a = fullJoin(csv_records, cleaned);
			
			let arr3 = [];
			
			csv_records.forEach((itm, i) => {
			  let temp = Object.assign({}, itm, cleaned[i] )
			  Object.keys(temp).forEach((key, i) => { temp[key] = temp[key] ? JSON.stringify(temp[key]).replace(",", "").replace(",", "") : temp[key] } );	
			  arr3.push(temp);
			});
			
			return arr3;
		})
		.then(function(results){
			return helpers.writeCsv(results,outfile);
		})
		.then(function(){
			console.log("DONE");
		})
	}
}
