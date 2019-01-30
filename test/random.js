function a(b){
    console.log("a:");
}

function b(c){
    console.log("b:")
}

function c(v){
    console.log("v:"+v)
}

a(b(c("hello world")))