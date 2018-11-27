const handleMapping = require("./responseMapping");

module.exports = async function(req, res, prev) {
    prev = await prev;
    if (prev.constructor.name=="Object") {
        console.log(prev)
        Object.keys(prev).forEach(field => {
            var handle = handleMapping[field];
            if (handle != null) handle(prev[field], res);
        });
        res.end();
    } else return prev;
};
