var compare = require('./comparator');

var a = "";

compare({
    type_case1: () => {
        var a;

        if ((a = "c") == "b" || (a = "c") == "c" || (a = "d") == "c") {
            console.log(a)
        }
    },
    type_case2: () => {
        
    },
}, 100000000)