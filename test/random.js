const typeCheck = require('../lib/typeFilter');

var checker = typeCheck(["null"])

var a = null;

console.log(checker(a))

