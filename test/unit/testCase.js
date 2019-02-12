var request = require("supertest");
const summarytestCase = require("./hyron");

var testInstance = request("http://localhost:5479");
 
testInstance.get("/summary/test-get-params")
.expect(200, function(err){
  console.log(err);
});