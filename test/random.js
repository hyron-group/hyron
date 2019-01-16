const http2 = require('http2');
const fs = require('fs');
var options = {
    key: fs.readFileSync('./.temp/key.pem'),
    cert: fs.readFileSync('./.temp/cert.pem'),
    allowHTTP1: true
};
var server = http2.createSecureServer(options, (req, res)=>{
    console.log("req req")
});
server.on('stream', (stream, requestHeaders) => {
    console.log(requestHeaders);
    stream.write('hello ');
    stream.end('world');
});

server.on("sessionError",(socket)=>{
    console.log("unknow protocol");

})
server.listen(8000, () => {
    console.log("server started");
});