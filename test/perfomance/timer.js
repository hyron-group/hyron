const loop = 10000000;

var a = ['1','3','6','4'];

var t1 = () => {
    var b= a[3];
};

var t2 = () => {
    var b= a['3'];
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
