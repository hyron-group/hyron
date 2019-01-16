var a = {b:'c'};

function f(){
    return [a.b];
}

var k = f();
k[0] = "d";


console.log(a);