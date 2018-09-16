const Busboy = require("busboy");
const ClientFile = require("../type/ClientFile");

function parserMultiPart(req, onComplete) {
    var data = {};
    var busboy = new Busboy({ headers: req.headers });
    busboy.on(
        "field",
        (name, val, fieldTruncated, valTruncated, encoding, type) => {
            data[name] = val;
        }
    );

    busboy.on("file", (field, file, name, encoding, type) => {
        file.on("data", content => {
            data[field] = new ClientFile(name, content, encoding, type);
        });
    });

    busboy.on("finish", () => {
        onComplete(data);
    });

    req.pipe(busboy);
}

module.exports = parserMultiPart;
