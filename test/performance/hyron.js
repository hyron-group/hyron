const hyron = require('../../index');

var app = hyron.getInstance(8080);

app.setting({
    style:'lisp',
    protocols : "http2",
    key:'.temp/localhost.key',
    cert:'.temp/localhost.crt'
});

app.enableServices({
    "" : "./test/performance/testCase"
})

app.startServer();