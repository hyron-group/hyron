const loop = 10000000;

function a (){
    return new Promise(res=>{
        res(true);
    })
}

var t1 = () => {
    var res = a();
    if(res instanceof Promise){
        res.then(data=>{
            res = data;
        })
    }
};

var t2 = () => {
    res = a();
    try{
        res.then(data=>{
            res = data;
        })
    } catch(e){}
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