const Checker = require("./Checker");


function handle (req, res, prev) {
    var err = Checker.checkData(this.$eventName, prev);
    if(err!=null) throw err;
    return prev;
}

function onCreate() {
    Checker.registerChecker(this.$eventName, this.$executer);
}

module.exports = {
    handle,
    onCreate,
}