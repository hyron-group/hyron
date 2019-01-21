var crc = require('crc');


var k = "fw-" + crc
        .crc24("handle".toString())
        .toString(16);

console.log(k);