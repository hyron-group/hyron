const path = require("path");

var projectDir = __dirname
    .substr(0, __dirname.indexOf("node_modules"));
if (projectDir == "") {
    projectDir = path.join(__dirname, "../");
}
module.exports = projectDir;