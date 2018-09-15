const ClientFile = require("../plugins/param-parser/type/ClientFile");
var check = input => {
    return (
        (input instanceof ClientFile) &
        (input != null && Buffer.byteLength(input.content) < 1000)
    );
};

check();
