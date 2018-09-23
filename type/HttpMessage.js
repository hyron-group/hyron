class HTTPMessage extends Error {
    constructor(code = StatusCode.OK, message = "") {
        super();
        this.message = message;
        this.code = code;
    }
}

module.exports = HTTPMessage;
