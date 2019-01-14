const hyron = require('../../index');

var app = hyron.getInstance(5479);

app.setting({
    style:'lisp',
    protocols : "http2"
});

app.enableServices({
    "" : "./test/performance/testCase"
})

app.startServer();