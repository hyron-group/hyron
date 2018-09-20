const hyron = require('./moduleManager');

var app = hyron.getInstance(3000);
app.enableModule({
    "" : require('../test/demo')
})

app.startServer();