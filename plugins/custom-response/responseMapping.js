const RESPONSE_HANDLE = {
    $type : (data, res)=>{
        res.setHeader("Content-Type", data);
    },
    $data : (data, res)=>{
        res.write(data);
    },
    $status : (data, res)=>{
        res.statusCode = data;
    },
    $header : (data, res)=>{
            Object.keys(data).forEach(key => {
                res.setHeader(key, data[key]);
            });
    },
    $message : (data, res)=>{
        res.statusMessage = data;
    },
    $redirect : (data, res)=>{
        res.setHeader("Location", prev.$redirect);
    }
}

module.exports = RESPONSE_HANDLE;