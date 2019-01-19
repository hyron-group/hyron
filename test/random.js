const node_path = require('path');

module.constructor.prototype.require = function (path) {
    path = node_path.join(__dirname, path);
    var extension = path.substr(path.lastIndexOf('.')+1);
    console.log("extension : "+extension);
    if(extension == "java"){

    }

    return this.constructor._load(path, this);
}

require('./hello.java');