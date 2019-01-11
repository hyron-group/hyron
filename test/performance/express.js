const app = require('express')();
const handler = new (require('./testCase'))();

app.listen(5477);