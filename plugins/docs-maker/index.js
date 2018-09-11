var app = require("express")();

app.set("view engine", "pug");
app.set('views', "./plugins/docs-maker");

app.get("/", (req, res) => {
    res.render("./api.pug", {
        appName: "Demo API",
        apis: [
            {
                method: "GET",
                url: "http://hyronjs.com/home",
                type: 'query',
                param: {
                    key1: { type: "string", size: "10" },
                    key2: { type: "number", lt: 20 }
                }
            },
            {
                method: "POST",
                url: "http://hyronjs.com/home",
                type: 'body',
                param: {
                    key1: { type: "string", size: "10" },
                    key2: { type: "number", lt: 20 }
                }
            },
            {
                method: "HEAD",
                url: "http://hyronjs.com/home",
                type: 'query',
                param: {
                    key1: { type: "string", size: "10" },
                    key2: { type: "number", lt: 20 }
                }
            },
            {
                method: "DELETE",
                url: "http://hyronjs.com/home",
                type: 'query',
                param: {
                    key1: { type: "string", size: "10" },
                    key2: { type: "number", lt: 20 }
                }
            },
            {
                method: "PUT",
                url: "http://hyronjs.com/home",
                type: 'body',
                param: {
                    key1: { type: "string", size: "10" },
                    key2: { type: "number", lt: 20 }
                }
            },
            {
                method: "REST",
                url: "http://hyronjs.com/home",
                type: 'rest',
                param: {
                    key1: { type: "string", size: "10" }
                }
            }
        ]
    });
});

app.listen(3003);