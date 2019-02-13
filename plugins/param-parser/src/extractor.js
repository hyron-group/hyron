const queryParser = require("../lib/queryParser");
const cookieParser = require("../lib/cookieParser");
const multiPartParser = require("../lib/multipartParser");
const rawBodyParser = require("../lib/rawBodyParser");
const urlEncodedParser = require("../lib/urlEncodedParser");
const dynamicUrl = require("../../../lib/dynamicURL");


function doneAsync(prev, data, argsList, onComplete) {
    if (data != null) {
        Object.assign(prev, data);
    }
    prev = resortDataIndex(prev, argsList);
    onComplete(prev);
}

var fieldMapping = {

    $req(req, res, prev) {
        prev.$req = req;
    },

    $res(req, res, prev) {
        prev.$res = res;
    },

    $query(req, res, prev) {
        var data = queryParser.parserRawQuery(req.url);
        prev.$query = data;
    },

    $headers(req, res, prev) {
        prev.$headers = req.headers;
    },

    $socket(req, res, prev) {
        prev.$socket = req.socket;
    },

    $trailers(req, res, prev) {
        prev.$trailers = req.trailers;
    },

    $events(req, res, prev) {
        prev.$events = req.on;
    },

    $cookie(req, res, prev) {
        var data = cookieParser(req.headers.cookie);
        if (data != null) {
            Object.assign(prev, data);
        }
    },

}

var bodyMapping = {
    $urlencoded(onComplete) {
        return function (req, res, prev) {
            urlEncodedParser(req, (data) => {
                if (data != null) {
                    Object.assign(prev, data);
                    onComplete(prev);
                }
            })
        }
    },

    $multipart(onComplete) {
        return function (req, res, prev) {
            multiPartParser(req, (data) => {
                if (data != null) {
                    Object.assign(prev, data);
                    onComplete(prev);
                }
            });
        }
    },

    $raw(onComplete) {
        return function (req, res, prev) {
            rawBodyParser(req, (data) => {
                if (data != null) {
                    Object.assign(prev, data);
                    onComplete(prev);
                }
            });
        }
    },

}

var extractor = {

    paramsParser(req, res, prev) {
        var url = req.url;
        var eor = url.indexOf("?");
        if (eor == -1) {
            eor = url.length;
        }
        var data = dynamicUrl.getParams(url.substr(0, eor));
        if (data != null) {
            Object.assign(prev, data);
        }
    },
    queryComplexParser(req, res, prev) {
        var data = queryParser.parseComplexQuery(req.url);
        if (data != null) {
            Object.assign(prev, data);
        }
    },

    flexBodyParser(onComplete, argsList) {
        return function (req, res, prev) {
            onComplete = (data) => {
                doneAsync(prev, data, argsList, onComplete);
            }
            var reqBodyType = req.headers["content-type"];
            if (reqBodyType == null) {
                onComplete(null);
            } else if (reqBodyType == "application/x-www-form-urlencoded") {
                urlEncodedParser(req, onComplete);
            } else if (reqBodyType >= "multipart" && reqBodyType < "multipart/z") {
                multiPartParser(req, onComplete);
            } else {
                rawBodyParser(req, onComplete);
            }
        }
    },

};

function resortDataIndex(data, argList) {
    if (data == null) return data;
    var resortInput = [];
    argList.forEach((key) => {
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


    if (params != null) {
        parserChain.push(extractor.paramsParser);
    }

    var hasNormalVal = false;
    argsList.forEach((key) => {
        var parser;
        if (key.charAt(0) != "$" &&
            params!=null &&
            !params.includes(key)) {
            hasNormalVal = true;
        }
        if ((parser = fieldMapping[key])) {
            parserChain.push(parser);
        }
    })

    var specialBodyVal;

    if (
        argsList.includes("$urlencoded") &&
        (specialBodyVal = "$urlencoded") ||

        argsList.includes("$multipart") &&
        (specialBodyVal = "$multipart") ||

        argsList.includes("$raw") &&
        (specialBodyVal = "$raw")

    ) {
        if (hasNormalVal) {
            if (!argsList.includes("$query") &&
                isQueryParamType(method)) {
                parserChain.push(extractor.queryComplexParser);
            }
        }

        parserChain
            .push(bodyMapping[specialBodyVal]((prev, data) => {
                doneAsync(prev, data, argsList, onComplete)
            }));

        return parserChain;
    }

    function done(req, res, prev) {
        prev = resortDataIndex(prev, argsList);
        onComplete(prev);
    }

    if (!hasNormalVal) {
        parserChain.push(done);

        return parserChain;
    }

    if (!argsList.includes("$query") &&
        isQueryParamType(method)) {
        parserChain.push(extractor.queryComplexParser);
        parserChain.push(done);
    } else if (isBodyParamType(method)) {
        parserChain.push(extractor.flexBodyParser(onComplete, argsList));
    } else {
        parserChain.push(done);
    }

    return parserChain;

}

function generalParserHandler(reqCfg, argsList) {
    return function (req, res, prev, onComplete) {
        var parserChain = getExtractDataHandlers(reqCfg, argsList, onComplete);
        parserChain.forEach((parser) => {
            parser(req, res, prev);
        });
    };
}

module.exports = generalParserHandler;