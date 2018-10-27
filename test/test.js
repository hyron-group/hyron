const hyron = require('../index');

var app = hyron.getInstance(3000);

app.enableService({
    "" : require('./demo')
})

app.startServer();