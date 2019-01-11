const hyron = require('../../index');

var app = hyron.getInstance(5479);

app.setting({
    style:'snake'
})

app.enableServices({
    "summary" : "./test/unit/apiDemo"
})

app.startServer();