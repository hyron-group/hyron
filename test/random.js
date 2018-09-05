const obj = require('../lib//objectParser');

var res = obj('{a:b, c:[d, e, {f:g},[i, j]]}')
// var res = obj('[a, [b, c, [d, e]],, [f, g]]')


console.log(res);

