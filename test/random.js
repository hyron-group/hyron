var editor = require('../lib/objectEditor');

var a = {
    b: {
        c: 'd'
    }
}

editor.replaceValue(["b"], a, (v) => {
    Object.freeze(v);

})


a.b.c = "e";


console.log(a)