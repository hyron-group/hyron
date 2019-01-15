const hyron = require('../../index');

var app = hyron.getInstance(5479);

app.setting({
    style:'lisp',
    protocols : "https",
    key:'.temp/key.pem',
    cert:'.temp/cert.pem'
});

app.enableServices({
    "" : "./test/performance/testCase"
})

app.startServer();