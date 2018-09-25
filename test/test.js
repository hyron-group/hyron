const hyron = require('../core/moduleManager');

var app = hyron.getInstance(3000);

app.enableModule({
    "" : require('./demo')
})

app.startServer();