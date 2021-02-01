# CDP
Conversational date parser

Performs context aware parsing of strings like 'year to date' or 'Q3 2020' or 'march-april'

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
