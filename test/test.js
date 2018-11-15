const hyron = require('../index');

var app = hyron.getInstance(5479);

app.enableService({
    "" : require('./demo')
})

app.startServer();