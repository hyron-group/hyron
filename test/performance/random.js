const compare = require('performance-tools');

function asn(){
    return new Promise((resolve)=>{
        setTimeout(()=>{
            resolve("done");
        }, 0)
    })
}

function asn2(cb){
    setTimeout(() => {
        cb("done")
    }, 0);
}

await function f(){
    return await asn;
}

await function g(a){
    return asn2;
}

compare.comparator({
    v1: () => {
        this.a = "haha";
        return f.call(this)
    },
    v2: () => {
        return g("hihi");
    },
}, {
    round: 8000090
})