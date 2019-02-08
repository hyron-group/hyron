const obj = require('../lib/objectEditor');

var o = {
    a:{
        b:{
            c:"d"
        }
    }
}

console.log(
    obj.getValue('a.b', o)
)