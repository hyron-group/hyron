const fs = require('fs');

const yaml = require('yaml');


var res = yaml.parse(fs.readFileSync("./appcfg.yaml").toString());

console.log(res);