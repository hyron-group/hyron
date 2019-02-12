const http = require("http");
var url = require("url");

var server = http.createServer((req, res) => {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    res.end("hello"+query.name)
});

server.listen(5478);