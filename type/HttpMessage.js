const StatusCode = require('./StatusCode');
class HTTPMessage extends Error {
    constructor(code = StatusCode.OK, message) {
        super();
        this.message = message==null?code:message;
        this.code = code;
    }
}

module.exports = HTTPMessage;
