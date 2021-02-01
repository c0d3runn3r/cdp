const assert=require("assert");
const CDP=require("../index.js");


// Last quarter
// current week
// end of week
// this month
// current month
// end of month




let today = new Date();
let conversational_tests=[

	{
		input: "YTD",
		today: new Date(2021,5,6),	// June 6 2021
		output: [{"year":2021,"month":1,"day":1},{"year":2021,"month":6,"day":6}]

	},
	{
		input: "today",
		today: new Date(2021,0,30),	// Jan 30 2021
		output: [{"year":2021,"month":1,"day":30}]

	},
	{
		input: "yesterday",
		today: new Date(2021,0,30),	// Jan 30 2021
		output: [{"year":2021,"month":1,"day":29}]

	},
	{
		input: "March through November",
		today: new Date(2021,0,30),	// Jan 30 2021
		output: [{"year":2021,"month":3,"day":1},{"year":2021,"month":11,"day":30}]

	},
	{
		input: "last week",
		today: new Date(2021,0,30),	// Jan 30 2021
		output: [{"year":2021,"month":1,"day":17},{"year":2021,"month":1,"day":23}]

	},
	{
		input: "this week",
		today: new Date(2021,0,30),	// Jan 30 2021
		output: [{"year":2021,"month":1,"day":24},{"year":2021,"month":1,"day":30}]

	}

];

let date_tests=[

	{
		input: "2020",
		output: [{"year":2020,"month":1,"day":1},{"year":2020,"month":12,"day":31}]

	},
	{
		input: "29JAN21-24FEB21",
		output: [{"year":2021,"month":1,"day":29},{"year":2021,"month":2,"day":24}]

	},
	{
		input: "2020-01-9 through 2021-02-01",
		output: [{"year":2020,"month":1,"day":9},{"year":2021,"month":2,"day":1}]

	},
	{
		input: "Q1 2020",
		output: [{"year":2020,"month":1,"day":1},{"year":2020,"month":3,"day":31}]

	},
	{
		input: "Q3",
		today: new Date(2019,0,30),	// Jan 30 2019
		output: [{"year":2019,"month":7,"day":1},{"year":2019,"month":9,"day":30}]

	},
	{
		input: "March 2017",
		output: [{"year":2017,"month":3,"day":1},{"year":2017,"month":3,"day":31}]

	},
	{
		input: "March",
		today: new Date(2019,0,30),	// Jan 30 2019
		output: [{"year":2019,"month":3,"day":1},{"year":2019,"month":3,"day":31}]

	},
	{
		input: "Aug 1st - March 1st",
		today: new Date(2019,0,30),	// Jan 30 2019
		output: [{"year":2019,"month":8,"day":1},{"year":2019,"month":3,"day":1}]

	},
	{
		input: "March 23 through April 20th 2020",
		today: new Date(2019,0,30),	// Jan 30 2019
		output: [{"year":2020,"month":3,"day":23},{"year":2020,"month":4, "day":20}]

	},
	{
		input: "March through April 2015",
		today: new Date(2019,0,30),	// Jan 30 2019
		output: [{"year":2015,"month":3,"day":1},{"year":2015,"month":4, "day":30}]

	},
	{
		input: "1/1 - 2/1",
		today: new Date(2019,0,30),	// Jan 30 2019
		output: [{"year": 2019,"month":1,"day":1},{"year":2019,"month":2,"day":1}]

	},
	{
		input: "1/1/20-1/2/21",
		today: new Date(2019,0,30),	// Jan 30 2019
		output: [{"year": 2020,"month":1,"day":1},{"year":2021,"month":1,"day":2}]

	}

 


];




describe("Conversational tests", function(){

	for(let test of conversational_tests)  {

		let cdp=new CDP(test.today);

		it(test.input, function(){

			let parsed = cdp.parse(test.input).map((r)=>r.toObject());
			assert.deepEqual(parsed, test.output);

		});
	}
});

describe("Date and range tests", function(){

	for(let test of date_tests)  {

		let cdp=new CDP(test.today);

		it(test.input, function(){

			let parsed = cdp.parse(test.input);
			assert.deepEqual(parsed.map((r)=>r.toObject()), test.output);

		});
	}
});


