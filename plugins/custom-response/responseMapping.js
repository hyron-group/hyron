const RESPONSE_HANDLE = {
    $type: (data, res) => {
        res.setHeader("Content-Type", data);
    },
    $data: (data, res) => {
        res.write(data);
    },
    $status: (data, res) => {
        res.statusCode = data;
    },
    $headers: (data, res) => {
        for (var key in data) {
            res.setHeader(key, data[key]);
        }
    },
    $message: (data, res) => {
        res.statusMessage = data;
    },
    $redirect: (data, res) => {
        res.statusCode = 302;
        res.setHeader("Location", data);
    }
}

module.exports = RESPONSE_HANDLE;