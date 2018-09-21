const ini = require('ini');
const fs = require('fs');

var content = ini.parse(fs.readFileSync('appcfg.ini').toString())
console.log(content)