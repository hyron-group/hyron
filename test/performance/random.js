const compare = require('performance-tools');

var i = "!hcfiashca";

compare.comparator({
    v2: () => {
        return "asdasdsd"+i;
    },
    v1: () => {
        return `asdasdsd${i}`;
    },
})