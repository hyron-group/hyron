async function a(){
    return 'a'
};

a().then((v)=>{
    return "baaa"
}).then(d=>{
    console.log("data : "+d)
})