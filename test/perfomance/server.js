// Raw node
const http = require("http");

var app = http.createServer((req, res) => {
    res.end("hello node");
});
``
app.listen(3001, () => {
    console.log("Node Server started at http://localhost:3001");
});

    // Express
    const express = require("express")();

    express.get("/showMyName", (req, res) => {
        var args = req.query.name;
        if ((typeof args == "string") & (args.length < 100))
            res.send("hello " + args);
        else res.send(403);
    });

    express.listen(3002, () => {
        console.log("Node Server started at http://localhost:3002");
    });
