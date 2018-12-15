const app = require('express')();
app.get("/showMyName", (req, res)=>{
    var name = req.query.name;
    res.send("hello "+name);
})

app.listen(5477);