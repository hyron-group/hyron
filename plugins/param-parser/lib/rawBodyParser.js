module.exports = function parser(req, onComplete) {
    var buf = [];
    req.on("data", (chunk) => {
        buf.push(chunk);
    });
    req.on("end", () => {
        var output = {};
        output.$body = Buffer.concat(buf);
        onComplete(output);
    });
    req.on("error", err => {
        onComplete(null, err);
    });
};