const hyron = require('../../index');

var app = hyron.getInstance(5479);

app.setting({
    style:'lisp'
})

app.enableServices({
    "" : "./test/performance/testCase"
})

app.startServer();