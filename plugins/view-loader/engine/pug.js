const pug = require("pug");
const fs = require("fs");
const fileExtension = ".pug";

var viewCache = {};
var viewDir = "";

module.exports = compile;

function render(path, data, res) {
    path = viewDir + "/" + path + fileExtension;
    var compiledView = viewCache[path];
    if (compiledView != null) {
        var renderedView = compiledView(data);
        res.end(renderedView);
    }
}

function compile(homeDir = "./") {
    viewDir = homeDir;
    scanPug(homeDir);
    return render;
}

function scanPug(path) {
    var childPath = path;
    try{
        var lsFile = fs.readdirSync(childPath);
        lsFile.forEach(name => {
            try {
                childPath = path + "/" + name;
                scanPug(childPath);
            } catch (err) {
                if (childPath.endsWith(fileExtension)) {
                    var compileResult = pug.compileFile(childPath);
                    viewCache[childPath] = compileResult;
                }
            }
        });
    } catch(err){
        console.error('plugin view-loader disabled because '+err.message)
    }
}
