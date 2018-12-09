const http = require('http');

var server = http.createServer((req, res)=>{
    res.end('hello')
});

server.listen(5478);

