const hyron = require('./moduleManager');

var app = hyron.getInstance(3000);
app.enableModule({
    user : require('../test/users')
})

app.startServer();