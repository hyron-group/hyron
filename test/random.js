require('../');

const dynamicURL = require('../lib/dynamicURL');

dynamicURL.registerUrl('/users/:uid/class/:classId');
dynamicURL.registerUrl('/users/:uid/room/:roomId');
dynamicURL.registerUrl('/users/:uid/argz/:orgz/depart/:name');

var eventName = dynamicURL.getEventName('/users/thangdjw/class/32');
console.log(eventName);
var param = dynamicURL.getParams('/users/thangdjw/class/32');
console.log(param)
