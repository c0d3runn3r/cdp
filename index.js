const moment=require("moment");

const MONTHS_LONG=["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const MONTHS_SHORT=["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];



class Result {

	constructor(y, m, d, flags={}) {

		let today=new Date();

		this.year=(typeof(y)!="undefined")?parseInt(y):today.getFullYear();
		this.month=(typeof(m)!="undefined")?parseInt(m):(1+today.getMonth());
		this.day=(typeof(d)!="undefined")?parseInt(d):(today.getDate());

		this._flags=flags;

	}


	toObject() {


		return {

			year	:	this.year,
			month	:	this.month,
			day		:	this.day
		}
	}


	get year_inferred() {

		return (('year_inferred' in this._flags) && this._flags.year_inferred);
	}

	set year_inferred(val) {

		this._flags.year_inferred=val?true:false;
	}

	get month_inferred() {

		return (('month_inferred' in this._flags) && this._flags.month_inferred);
	}

	set month_inferred(val) {

		this._flags.month_inferred=val?true:false;
	}

	// get day_inferred() {

	// 	return ('day_inferred' in this._flags);
	// }

	// set day_inferred(val) {

	// 	this._flags.day_inferred=val?true:false;
	// }

}



class Cdp {

	/**
	 * Constructor
	 *
	 * @param {Date} today the date to use for today (influences e.g. "this week" etc)
	*/
	constructor(today=null){

		this.today=today||new Date();

	}

	/**
	 * Parse
	 *
	 * Parse a string that may contain a range of dates
	 *
	 * @param {string} str the string to parse
	 * @return {Result[]} the result or results
	 *
	 */
	parse(str=""){

		// Get a copy of the string, clean it up, and split it
		let strings=str
				.replace(/\s+/g," ")							// Clean whitespace
				.replace(/(\d)(st|ng|rd|th)/g,"$1")				// Remove unnecessary suffixes
				//.replace(/[^a-z0-9\-\/]/g," ")					// Remove anything that is not a number, letter, or / -
				.toLowerCase()									// Lowercase
				.split(/\b(through|thru|until|to)\b/)			// Split
				.filter((s)=>(s!="through" && s!="thru" && s!="until" && s!="to"));		// Capture groups remain in output, we have to remove them

		// If there is only one hyphen, it's a splitter 
		if(strings.length<2 && strings[0].match(/\-/)) {

			strings = strings[0].split(/\-/);
		}					

		// Trim the strings
		strings=strings.map((s)=>s.trim());


		// Parse single dates into results and filter the results
		let results=[];
		for(let n in strings) {

			let s=strings[n];
			let result=this.parse_single(s, n);

			for(let item of result) {

				if(item != null) results.push(item);
			}
		}
		
		// If we have more than one date range, filter so that we are inclusive
		if(results.length>2) {

			results=[results[0], results[results.length-1]];

			// console.log("trimming!");
		}


		// If one of the dates has an inferred part, copy from the other one
		if(results.length==2) {

			if(results[0].year_inferred && (!results[1].year_inferred)) { results[0].year=results[1].year; results[0].year_inferred=false; }
			if(results[1].year_inferred && (!results[0].year_inferred)) { results[1].year=results[0].year; results[1].year_inferred=false; }

			if(results[0].month_inferred && (!results[1].month_inferred)) { results[0].year=results[1].year; results[0].month_inferred=false; }
			if(results[1].month_inferred && (!results[0].month_inferred)) { results[1].year=results[0].year; results[1].month_inferred=false; }

		}

		return results;
	}

	/**
	 * Parse single
	 *
	 * Parse a single string that represents a date
	 *
	 * @param {string} str the string to parse
	 * @param {number} ord the ordinal of this string in the original group
	 * @return {Result[]} the result, or null if no date found
	 *
	 */
	parse_single(str, ord) {

		// console.log(`***** parse_single called with '${str}'`);

		let year, month, day;

		// YTD
		if(str=="ytd") {

			return [
				new Result(this.today.getFullYear(), 1, 1, { year_inferred: true}),
				new Result(this.today.getFullYear(), 1+this.today.getMonth(), this.today.getDate(), { year_inferred: true}),
			];

		}

		// Today
		if(str=="today") {

			return [
				new Result(this.today.getFullYear(), 1+this.today.getMonth(), this.today.getDate()),
			];

		}

		// // A bare month
		// let month=this.is_a_month(str);
		// if(month) {

		// 	// Get a date for the end of month
		// 	let eom=new Date(this.today.getFullYear(), month, 0)

		// 	return [new Result(this.today.getFullYear(), month, (ord==0)?1:eom.getDate())];			

		// }

		// Yesterday
		if(str=="yesterday") {

			let yesterday=moment(this.today).subtract(1, 'day');

			return [
				new Result(yesterday.year(), 1+yesterday.month(), yesterday.date())
			];
		}

		// Last week
		if(str=="last week") {

			let start=moment(this.today).subtract(1, 'week').startOf('week');
			let end=moment(start).endOf('week');

			return [
				new Result(start.year(), 1+start.month(), start.date()),
				new Result(end.year(), 1+end.month(), end.date())
			];
		}

		// This week
		if(str=="this week") {

			let start=moment(this.today).startOf('week');
			let end=moment(start).endOf('week');

			return [
				new Result(start.year(), 1+start.month(), start.date()),
				new Result(end.year(), 1+end.month(), end.date())
			];
		}

		// A bare year "1998"
		if(str.match(/^\d\d\d\d$/)) {

			return [
				new Result(parseInt(str), 1, 1, { month_inferred: true, day_inferred: true }),
				new Result(parseInt(str), 12, 31, { month_inferred: true, day_inferred: true })
			];
		}

		// Convert dashes to slashes and cleanup duplicate/trailing/leading slashes and whitespace
		str=str.replace(/\-/g,"/").replace(/\/+/g,"/").replace(/\/$/,"").replace(/^\//,"").trim();

		// YYYY/M/D format
		let match=str.match(/(\d\d\d\d)\/(\d{1,2})\/(\d{1,2})/);
		if(match) {

			return[ new Result(parseInt(match[1]),parseInt(match[2]),parseInt(match[3]))];
		}

		// M/D/YY format
		match=str.match(/(\d{1,2})\/(\d{1,2})\/(\d\d)/);
		if(match) {

			let prefix=parseInt((""+this.today.getFullYear()).substr(0,2))*100;		// e.g. 1900 or 2000
			return[ new Result(prefix+parseInt(match[3]),parseInt(match[1]),parseInt(match[2]))];
		}

		// 29JAN21 format
		match=str.match(/(\d{1,2})(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(\d\d)/);
		if(match) {

			let prefix=parseInt((""+this.today.getFullYear()).substr(0,2))*100;		// e.g. 1900 or 2000
			return[ new Result(prefix+parseInt(match[3]),this.is_a_month(match[2]),parseInt(match[1]))];
		}

		// Extract a 4 digit year, if there is one
		match=str.match(/(\d\d\d\d)/);
		if(match) {

			year=parseInt(match[1]);

			// Remove the year from the string and clean up
			str=str.replace(/\d\d\d\d/,"").replace(/\/+/g,"/").replace(/\/$/,"").replace(/^\//,"").trim();
		}

		// A quarter like "Q1"
		match=str.match(/^q([1-4])$/);
		if(match) {

			let start=moment(`${year?year:this.today.getFullYear()} Q${match[1]}`, "YYYY Q");
			let end=moment(start).endOf("quarter");

			return [
				new Result(start.year(), 1+start.month(), start.date(), { year_inferred: year?false:true}),
				new Result(end.year(), 1+end.month(), end.date(), { year_inferred: year?false:true})
			];
		}


		// A Month/day like "1/1"
		match=str.match(/(\d{1,2})[\s\/](\d{1,2})/);
		if(match) {

			// Capture the day
			day=parseInt(match[2]);
			month=parseInt(match[1]);

			return [ new Result(year?year:this.today.getFullYear(), month, day, { year_inferred: year?false:true})];

		}


		// See if we have a month/day combo like "20MAR" or "20 March" or "20-MAR"
		match=str.match(/(\d{1,2})[\s\-\/]*([a-z]+)/);
		if(match) {

			// Capture the day
			day=parseInt(match[1]);

			// Remove the day (and slash, if there is one) and clean up
			str=str.replace(/(\d{1,2}[\s\-\/]*)([a-z]+)/, "$2").trim();
		}

		// If still no day, look for the other kind of month/day... "MAR20" or "March 20" or "MAR 20"
		if(!day) {

			match=str.match(/([a-z]+)[\s\-\/]*(\d{1,2})/);
			if(match) {

				// Capture the day
				day=parseInt(match[2]);

				// Remove the day (and slash, if there is one) and clean up
				str=str.replace(/([a-z]+)[\s\-\/]*(\d{1,2})/, "$1").trim();
			}

		}

		// A month like "March" or "mar"
		month=this.is_a_month(str);
		if(month) {

			if(day) {

				let date=moment(`${year?year:this.today.getFullYear()} ${month} ${day}`, "YYYY M D");

				return [ new Result(date.year(), 1+date.month(), date.date(), { year_inferred: year?false:true})];
			}

			let start=moment(`${year?year:this.today.getFullYear()} ${month}`, "YYYY M");
			let end=moment(start).endOf("month");

			return [
				new Result(start.year(), 1+start.month(), start.date(), { year_inferred: year?false:true}),
				new Result(end.year(), 1+end.month(), end.date(), { year_inferred: year?false:true})
			];
		}





		return [null];
	}


	is_a_month(str) {

		let ord=MONTHS_LONG.indexOf(str);
		if(ord != -1) return ord+1;

		ord=MONTHS_SHORT.indexOf(str);
		if(ord != -1) return ord+1;



		return 0;
	}




}

module.exports=exports=Cdp;








