const handleMapping = require("./responseMapping");

function handle(req, res, prev) {
    for (var field in prev) {
        var handle = handleMapping[field];
        if (handle != null) {
            handle(prev[field], res);
        }
    }
    if (prev.$end == null) {
        res.end();
    }
}

module.exports = {
    handle,
    typeFilter: ["Object"],
};