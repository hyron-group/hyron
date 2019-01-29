const compare = require('performance-tools');

function f(){
    return this.a;
}

function g(a){
    return a;
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