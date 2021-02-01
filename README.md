# CDP
Conversational date parser

Performs context aware parsing of strings like 'year to date' or 'Q3 2020' or 'march-april'.

### Installation
```bash
npm install --save conversational-date-parser
npm run test
```

### Usage
```js
const Cdp=require("conversational-date-parser");

let cdp=new CDP();
let result=cdp.parse("March through April 2015"); // [{"year":2015,"month":3,"day":1},{"year":2015,"month":4, "day":30}]

````

### Notes
CDP.parse() returns an array that is either empty, or contains two elements representing the range inferred by the text input.  Input like "today" will result in a one-day date range; calling .toDate() on each result item will result in a Date() object that represents the first millisecond and the last millisecond of that day, respectively.


### Todo
- Remove dependency on moment.js
- Finish documenting index.js
- Add build task for compiling documentation
- Clean up one of the tests that is not a unit test
- Add more cases ("thursday through friday", etc)