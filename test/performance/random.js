const compare = require('performance-tools');

var c = ['a', 'b', "c", "e", "f"];

compare.comparator({
    v1: () => {
        return c.indexOf('e') != -1;

    },
    v2: () => {
        return c.includes('e');
    },
}, {
    round: 1000090
})