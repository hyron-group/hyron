// Raw node
const http = require("http");


class rawNode {
    
    start(){

        var app = http.createServer((req, res) => {
            var a = "thang";
            res.end("hello node "+a);
        });
        
        app.listen(3001, () => {
            console.log("Node Server started at http://localhost:3001");
        });
    }
}

var app = new rawNode();
app.start();