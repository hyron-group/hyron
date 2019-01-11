module.exports = {
    info(msg){
        var msg = `\x1b[1;30m${msg}\x1b[0m`;
        console.info(msg);
    },
    title(msg){
        var msg = `\x1b[1;36m${msg}\x1b[0m`;
        console.log(msg);
    },
    success(msg){
        var msg = `\x1b[1;32m${msg}\x1b[0m`;
        console.log(msg);
    },
    error(msg){
        var msg = `\x1b[1;31m${msg}\x1b[0m`;
        console.error(msg);
    },
    warn(msg){
        var msg = `\x1b[1;33m${msg}\x1b[0m`;
        console.warn(msg);
    },
    log(msg){
        console.log(msg);
    }
}