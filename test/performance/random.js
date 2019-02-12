const compare = require("performance-tools");

var origin = `/user/:uid/class/:cid`;
var ts = "/user/thangdjw/class/pt12354";
var reg = new RegExp(`/user/([\\w\\d_\\-+]*)/class/([\\w\\d_\\-+]*)`);

var static = ["user", "class"];

compare.comparator({
    v1: () => {
        return reg.test(ts);
    },
    v2: () => {
        for (var i = 0; i < static.length; i++) {
            if (ts.indexOf(static[i]) == -1) return false;
        }
        return true;
    },
}, {
    round: 8000000
})