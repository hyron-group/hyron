

const plMapping = {
    java : {
        complier : "java -c <path>",
        run : "java <path>"
    }
};

function getRunner(ext, path){
    var cmd = plMapping[ext];
    if(cmd==null) {
        return null;
    }

}