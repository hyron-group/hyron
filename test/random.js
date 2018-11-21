async function a(){
    setTimeout(()=>{
        
    }, 2000)
}

console.log(a.constructor.name == 'AsyncFunction')