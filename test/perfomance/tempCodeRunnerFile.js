// Express
const express = require("express")();

express.get("/user/showMyName", (req, res) => {
    var args = req.query.name;
    if ((typeof args == "string") & (args.length < 100))
        res.send("hello " + args);
    else res.send(403);
});

express.listen(3002, () => {
    console.log("Node Server started at http://localhost:3002");
});
