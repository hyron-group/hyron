const loop = 1000000;
var pug = require("pug");
var comp = pug.compileFile("./test/hello.pug", {cache:true, });

var t1 = () => {
    var res = comp({ name: "thang" });
};

var t2 = () => {
    // var res = comp({ name: "thang" });
};

// ------------------------------
async function compare() {
    console.time("t1");
    for (var i = 0; i < loop; i++) {
        await t1();
    }
    console.timeEnd("t1");

    console.time("t2");
    for (var i = 0; i < loop; i++) {
        await t2();
    }
    console.timeEnd("t2");
}
compare();
