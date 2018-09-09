const loop = 1;

function a (){
    return "hello"
}

var t1 = () => {
    a();
};

var t2 = () => {
    a();
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