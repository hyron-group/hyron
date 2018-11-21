/**
 * This fontware used to load param from http request into 'this' scope
 * After loaded, you can used some of args in main handle function with syntax : this.$var_name
 * This support functions include :
 * $headers: "req.headers"
 * $method: "req.method"
 * $httpVersion: "req.httpVersion"
 * $connection: "req.connection"
 * $socket: "req.socket"
 * $close:"req.close"
 * $setTimeout:"req.setTimeout"
 * $timeout:"req.timeout"
 * $statusMessage: "req.statusMessage"
 * $rawUrl: "req.url"
 * $trailers: "req.trailers",
 */
module.exports = require("./thisArgsLoader_fw");
