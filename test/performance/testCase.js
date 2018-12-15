var compare = require('./comparator');

var a = {a:'b'};

var b = {b:'c'};


compare({
    setup: () => {
        return true
    },

    type_case1: () => {
        var c = a;
        return c;
    },

    type_case2: () => {
        var c = {};
        Object.assign(c, a, b)
        return c;

    },
}, 100000)
