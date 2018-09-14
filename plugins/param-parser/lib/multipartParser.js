const net = require('net');

function parserMultiPart(req, chunk){
    return chunk.toString();
}

module.exports = parserMultiPart;
