const handleMapping = require("./responseMapping");

module.exports = function (req, res, prev) {
    if (prev != null && prev.constructor.name == "Object") {
        Object.keys(prev).forEach(field => {
            var handle = handleMapping[field];
            if (handle != null) handle(prev[field], res);
        });
        res.end();
    } else return prev;
};