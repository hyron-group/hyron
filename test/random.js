// const fs = require('fs');
// const yaml = require('yaml');
// var res = yaml.parse(fs.readFileSync("./appcfg.yaml").toString());
// console.log(res);

var a = {
    b: {
        c: {
            d: {
                e: 'f'
            }
        }
    }
}



function replaceField(paths, map, val) {
    var temp = map;

    if (paths != null) {
        for (var i = 0; i < paths.length-1; i++) {
            var key = paths[i];
            temp = temp[key];
        }

        if (val instanceof Function) {
            val(temp[paths[paths.length - 1]]);
        } else {
            temp[paths[paths.length - 1]] = val;
        }
    }
}

replaceField(['b', 'c', 'd'], a, "k")

console.log(JSON.stringify(a, null, 4));