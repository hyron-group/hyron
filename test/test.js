const hyron = require('../index');
require('./nodejs');
require('./express')

var app = hyron.getInstance(5479);

app.setting({
    // style:'lisp'
})

app.enableService({
    "" : require('./demo')
})

app.startServer();