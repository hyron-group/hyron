function passURLDecodedToVar(decodedVar) {
    var output = {};
    decodedVar.split("&").forEach(val => {
        var dataPart = val.split("=");
        output[dataPart[0]] = dataPart[1];
    });
    return output;
}

function parser(req, onComplete) {
    var buf = [];
    req.on("data", (chunk) => {
        buf.push(chunk);
    });
    req.on("end", () => {
        var data = Buffer.concat(buf);
        data = decodeURI(data);

        var output = passURLDecodedToVar(data);
        onComplete(output);
    });
    req.on("error", (err) => {
        onComplete(null, err);
    });
}

module.exports = parser;