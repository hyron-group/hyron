const loop = 1000000;
const event = require('events');
var eventListener = new event();
var handle = ()=>{
    var x=1;
};
eventListener.on('call',handle);

var listenerHolder = {
    call:handle
};

var t1 = () => {
    listenerHolder['call']();
};

var t2 = () => {
    eventListener.emit(handle);
};

// ------------------------------
async function compare() {
    console.time("t1");
    for (var i = 0; i < loop; i++) {
        await t1();
    }
    console.timeEnd("t1");

    console.time("t2");
    for (var i = 0; i < loop; i++) {
        await t2();
    }
    console.timeEnd("t2");
}
compare();
