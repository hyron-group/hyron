const request = require('request');
const loop = 1;



var c=0;
var startTime2 = new Date().getTime();
for(var i=0; i<loop; i++)
request.get('http://localhost:3001/sample', ()=>{
    if(++c>=loop){
        var endTime2 = new Date().getTime();
        console.log("express : "+(endTime2-startTime2)+"ms");
    }
});



var c1=0;
var startTime = new Date().getTime();
for(var i=0; i<loop; i++)
request.post('http://localhost:3000/user/sample', ()=>{
    if(++c1>=loop){
        var endTime = new Date().getTime();
        console.log("hyron : "+(endTime-startTime)+"ms");
    }
});