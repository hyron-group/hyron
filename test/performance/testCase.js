var compare = require('./comparator');
var o = {
    b:'c',
    c:'d',
    d:'e'
}

var m = new Map();
m.set("b", "c");
m.set("c", "d");
m.set("d","e");

compare({
    setup: () => {
        return true
    },

    type_case1: () => {
        return o['d'];
    },

    type_case2: () => {
        return m.get('d');
    },
}, 100000000)
