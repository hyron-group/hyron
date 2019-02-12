const hyron = require("../../index");

var app = hyron.getInstance(5479);

app.setting({
    style:"lisp",
    // protocol : "http2",
    key:".temp/localhost.key",
    cert:".temp/localhost.crt"
});

app.enableServices({
    "" : "./test/performance/testCase"
});

app.startServer();