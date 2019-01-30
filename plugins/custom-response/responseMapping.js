const cookie = require('cookie');

const RESPONSE_HANDLE = {
    $addTrailers(data, res) {
        res.addTrailers(data);
    },
    $cookie(data, res) {
        var {
            content,
            options
        } = data;
        var serializeCookie = [];
        for (var key in content) {
            var val = content[key];
            serializeCookie.push(cookie.serialize(key, val, options));
        }
        res.setHeader("Set-Cookie", serializeCookie);
    },
    $data(data, res) {
        if (data instanceof Array) {
            res.write.apply(null, data);
        } else {
            res.write(data);
        }
    },
    $end(data, res) {
        if (data instanceof Array) {
            res.end.apply(null, data);
        } else res.end(data);
    },

    $headers(data, res) {
        for (var key in data) {
            res.setHeader(key, data[key]);
        }
    },
    $headersSent(data, res) {
        res.headersSent(data);
    },

    $message(data, res) {
        res.statusMessage = data;
    },
    $redirect(data, res) {
        res.statusCode = 302;
        res.setHeader("Location", data);
    },
    $removeHeader(data, res) {
        if (data != null)
            data.forEach(field => {
                res.removeHeader(field);
            })
    },
    $sendDate(data, res) {
        res.sendDate(data);
    },
    $response(data, res){
        data(res);
    },
    $timeout(data, res) {
        res.setTimeout(data);
    },
    $socket(data, res) {
        data(res.socket);
    },
    $status(data, res) {
        res.statusCode = data;
    },
    $type(data, res) {
        res.setHeader("Content-Type", data);
    },
    $writeHead(data, res) {
        res.apply(null, data);
    },
    $writeProcessing(data, res) {
        if (data)
            res.writeProcessing();
    },
    $writeContinue(data, res) {
        if (data)
            res.writeContinue();
    },
    $onClose(data, res) {
        res.on("close", data);
    },
    $onFinish(data, res) {
        res.on("finish", data);
    }
}

module.exports = RESPONSE_HANDLE;