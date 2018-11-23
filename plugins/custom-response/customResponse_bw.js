module.exports = async function(req, res, prev) {
    prev = await prev;
    if (typeof prev != "object" | !prev instanceof Array) return prev;

    var data = prev.$data;
    if (prev.$type != null) res.setHeader("Content-Type", prev.$type);
    if (prev.$status != null) res.statusCode = prev.$code;
    if (prev.$message != null) res.statusMessage = prev.$message;
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
