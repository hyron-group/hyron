const http = require("http");
var url = require("url");

var server = http.createServer((req, res) => {
    var urlParts = url.parse(req.url, true);
    var query = urlParts.query;
    res.end("hello"+query.name)
});

server.listen(5478);