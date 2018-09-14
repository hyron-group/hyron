const loop = 100000;

var a = { "a,b,c": "aohwefoi" };
var b = ['a','b','c'];

var t1 = () => {
    var res = a[b+''];
};

var t2 = () => {
    var res = a["a,b,c"]
}

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
