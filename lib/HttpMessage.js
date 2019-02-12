const StatusCode = require("./StatusCode");
class HTTPMessage extends Error {
    /**
     *Used to throw to client a http error
     * @param {*} [code=StatusCode.OK]
     * @param {*} message
     * @memberof HTTPMessage
     */
    constructor(code = StatusCode.OK, message) {
        super();
        this.message = message==null?code:message;
        this.code = code;
    }
}

module.exports = HTTPMessage;
