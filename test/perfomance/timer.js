const loop = 1;

var src = 'ashdiahgfalrfbadkjvbagf';

var crypto = require('crypto');

var t1 = () => {
    var res = crypto.createHash('sha1').digest(src).toString('hex');
    console.log(res)
};

var t2 = () => {
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