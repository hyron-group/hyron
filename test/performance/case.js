var compare = require('./comparator');

var a = class {
    constructor(){
        this.b = "c"
    }

    t(){
        delete this.b;
        return this;
    }
}

compare({
    type_case1: () => {
        new a().t();
    },
    type_case2: () => {
        
    },
}, 100000)