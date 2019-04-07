const child_process = require("child_process");

function checkIfYarnInstalled(){
    
}

child_process.exec("yarna version", (err)=>{
    console.log(err==null)
});