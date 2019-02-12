const queryParser = require("../lib/queryParser");
const cookieParser = require("../lib/cookieParser");
const multiPartParser = require("../lib/multipartParser");
const rawBodyParser = require("../lib/rawBodyParser");
const urlEncodedParser = require("../lib/urlEncodedParser");
const dynamicUrl = require("../../../lib/dynamicURL");

var extractor = {
    cookieParser(req) {
        return cookieParser(req.headers.cookie);
    },
    paramsParser(req) {
        var url = req.url;
        var eor = url.indexOf("?");
        if (eor == -1) {
            eor = url.length;
        }
        var output = dynamicUrl.getParams(url.substr(0, eor));
        return output;
    },
    queryParser(req) {
        return queryParser(req.url);
    },
    bodyParser(req, onComplete) {
        var reqBodyType = req.headers["content-type"];
        if (reqBodyType == null) {
            onComplete(null);
        } else if (reqBodyType == "application/x-www-form-urlencoded") {
            urlEncodedParser(req, onComplete)
        } else if (reqBodyType >= "multipart" && reqBodyType < "multipart/z") {
            multiPartParser(req, onComplete);
        } else {
            rawBodyParser(req, onComplete)
        }
    },
}

function resortDataIndex(data, argList) {
    if (data == null) return data;
    var resortInput = [];
    argList.forEach(key => {
        resortInput.push(data[key]);
    });

    return resortInput;
}

function isBodyParamType(method) {
    return (method == "POST") || (method == "PUT") || (method == "PATCH");
}

function isQueryParamType(method) {
    return (method == "GET") || (method == "DELETE") || (method == "HEAD");
}

function getExtractDataHandlers(reqCfg, argsList, onComplete) {
    var {
        method,
        params
    } = reqCfg;

    var parserChain = [];

    if (argsList.includes("$req")) {
        parserChain.push(function parserClientRequest(req, res, data) {
            Object.assign(data, req);
        })
    }

    if (argsList.includes("$res")) {
        parserChain.push(function parserClientRequest(req, res, data) {
            Object.assign(data, res);
        })
    }

    if (argsList.includes("$headers")) {
        parserChain.push(function passHeaders(req, res, prev) {
            Object.assign(data, req.headers)
        })
    }

    if (argsList.includes("$socket")) {
        parserChain.push(function passSocket(req, res, prev) {
            Object.assign(data, req.socket)
        })
    }

    if (argsList.includes("$trailers")) {
        parserChain.push(function passTrailers(req, res, prev) {
            Object.assign(data, req.trailers)
        })
    }

    if (argsList.includes("$events")) {
        parserChain.push(function passTrailers(req, res, prev) {
            Object.assign(data, req.on)
        })
    }

    if (argsList.includes("$cookie")) {
        parserChain.push(function parserParamsData(req, res, data) {
            var cookieData = extractor.cookieParser(req);
            if (cookieData != null) {
                Object.assign(data, cookieData);
            }
        })
    }

    if (params != null) {
        parserChain.push(function parserParamsData(req, res, data) {
            var paramsData = extractor.paramsParser(req);
            if (paramsData != null) {
                Object.assign(data, paramsData);
            }
        })
    }

    if (isQueryParamType(method)) {
        parserChain.push(function parserQueryData(req, res, data) {
            var queryData = extractor.queryParser(req);
            if (queryData != null) {
                Object.assign(data, queryData);
            }
        })
    }

    function done(req, res, data) {
        data = resortDataIndex(data, argsList);
        onComplete(data);
    }

    if (isBodyParamType(method)) {
        parserChain.push(function parserBodyData(req, res, data) {
            extractor.bodyParser(req, (bodyData) => {
                if (bodyData != null) {
                    Object.assign(data, bodyData);
                }
                done(req, res, data);
            });
        })
    } else {
        parserChain.push(done);
    }

    return parserChain;
}

function generalParserHandler(reqCfg, argsList) {
    return function (req, res, data, onComplete) {
        var parserChain = getExtractDataHandlers(reqCfg, argsList, onComplete);
        parserChain.forEach(parser => {
            parser(req, res, data);
        })
    }
}

module.exports = generalParserHandler;