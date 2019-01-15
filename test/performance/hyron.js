const hyron = require('../../index');

var app = hyron.getInstance(null, "localhost");

app.setting({
    style:'lisp',
    // protocols : "http2",
    key:'.temp/key.pem',
    cert:'.temp/cert.pem'
});

app.enableServices({
    "" : "./test/performance/testCase"
})

app.startServer();