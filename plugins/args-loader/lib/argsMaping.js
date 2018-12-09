var supportedArgs = {
    $headers: "req.headers",
    $method: "req.method",
    $httpVersion: "req.httpVersion",
    $connection: "req.connection",
    $socket: "req.socket",
    $close:"req.close",
    $setTimeout:"req.setTimeout",
    $timeout:"req.timeout",
    $statusMessage: "req.statusMessage",
    $rawUrl: "req.url",
    $trailers: "req.trailers",
};

module.exports = supportedArgs;