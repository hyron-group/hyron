const hyron = require('./moduleManager');

var app = new hyron(3000);
app.enableModule({
    user : require('../test/users')
})

app.startServer();