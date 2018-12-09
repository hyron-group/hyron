var input = "showMYName";

var match;
var reg = /[A-Z]+/g;

while((match = reg.exec(input))!=null){
    console.log(match)
}

// console.log()