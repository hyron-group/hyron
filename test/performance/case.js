var compare = require('./comparator');

var a = "";

compare({
    type_case1 : ()=>{
        return (typeof a)
    },
    type_case2 : ()=>{
        return (a instanceof String)
    },
}, 100000000)