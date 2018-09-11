const loop = 1000000;

var a={a:'b', c:'d', e:'f', g:'h', l:'m'}
var b=new Map(Object.entries(a));

var t1 = () => {
    var exist = a['l'] != null?true:false
};

var t2 = () => {
    var exist = b.has('l')
};





// ------------------------------
async function compare(){

    console.time("t1");
    for (var i = 0; i < loop; i++) {
        await t1();
    }
    console.timeEnd("t1");
    
    console.time("t2");
    for (var i = 0; i < loop; i++) {
        await 
        t2();
    }
    console.timeEnd("t2");
}
compare()