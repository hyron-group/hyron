const writelog = require("writelog");

module.exports = function(method, path, args) {
  var content = `${method.toUpperCase()} : ${path}`;
  var param = "";
  if (["get", "head", "delete"].includes(method)) {
    param = `\nQUERY :`;
  } else {
      param=`\nBODY :`;
  }

  if(args.length>0)
  args.forEach(element => {
    var name = element;

    param += `\n  - ${name}`;
  });

  content+=param;

  writelog('API', content, {dateFormat:null, separateLine:"", openLog:false});
};
