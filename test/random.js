const type = require('../lib/typeFilter');

class D {

}

class E {

}


var t = type([

    D,
    "string"
])

console.log(t.toString())

