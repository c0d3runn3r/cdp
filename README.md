# CDP
Conversational date parser


### Installation
```bash
npm install --save conversational-date-parser
mocha
```

### Usage
```js
const Cdp=require("conversational-date-parser");

let cdp=new CDP();
let result=cdp.parse("March through April 2015"); // [{"year":2015,"month":3,"day":1},{"year":2015,"month":4, "day":30}]

````
