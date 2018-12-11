const handleMapping = require("./responseMapping");

function handle(req, res, prev) {
    Object.keys(prev).forEach(field => {
        var handle = handleMapping[field];
        if (handle != null) handle(prev[field], res);
    });
    res.end();
};

module.exports = {
    handle,
    typeFilter : ["Object"],
}