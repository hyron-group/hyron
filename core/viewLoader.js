var engine = null;

function setEngine(name){
    if(name='pug'){
        engine = getPugEngine;
    } else throw new Error(`View engine ${name} does not support yet`)
}

function render(path, args){
    return engine(path, args)
}


function getPugEngine(path, args){
    const pug = require('pug');
    pug.compileFile(path, {})
}