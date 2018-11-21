const Busboy = require("busboy");
const ClientFile = require("../type/ClientFile");
const stringToObject = require('../../../lib/objectParser');

function parserMultiPart(req, onComplete) {
    var data = {};
    var busboy = new Busboy({ headers: req.headers });
    busboy.on(
        "field",
        (name, val, fieldTruncated, valTruncated, encoding, type) => {
            data[name] = stringToObject(val);
        }
    );

    busboy.on("file", (field, file, name, encoding, type) => {
        var buf = [];
        file.on("data", (chunk)=>{
            buf.push(chunk);
        });
        file.on("data", () => {
            var content = Buffer.concat(buf);
            data[field] = new ClientFile(name, content, encoding, type);
        });
    });

    busboy.on("finish", () => {
        onComplete(data);
    });

    req.pipe(busboy);
}

module.exports = parserMultiPart;
