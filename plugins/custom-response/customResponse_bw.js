module.exports = async function(req, res, prev) {
    if (typeof await prev != "object" | !prev instanceof Array) return prev;

    var data = prev.$data;
    if (prev.$type != null) res.setHeader("Content-Type", result.$type);
    if (prev.$status != null) res.statusCode = res.$code;
    if (prev.$message != null) res.statusMessage = res.$message;
    if (prev.$headers != null) {
        var header = prev.$header;
        Object.keys(header).forEach(key => {
            res.setHeader(key, header[key]);
        });
    }
    if (prev.$redirect != null) {
        res.setHeader("Location", prev.$redirect);
    }

    res.end(data);
};
