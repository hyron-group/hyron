const ini = require('ini');
const fs = require('fs');

var data = fs.readFileSync('./appcfg.ini').toString();
data = ini.parse(data);

console.log(data)