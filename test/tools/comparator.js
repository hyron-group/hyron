const vm = require("vm");

function compare(handle, round) {
    Object.keys(handle).forEach(name => {
        var sandbox = {
            runTimeTest,
            name,
            handle,
            round
        };
        vm.runInNewContext(`runTimeTest(name, handle, round)`, sandbox);
    });
}

function runTimeTest(name, handle, round) {
    var handleExecuter = handle[name];
    var timerLabel = name;
    var result;
    console.time(timerLabel);
    for (var i = 0; i < round; i++) {
        result = handleExecuter();
    }
    console.timeEnd(timerLabel);
    console.log(result);
}

module.exports = compare;
