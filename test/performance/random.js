const compare = require("performance-tools");

var origin = `/user/:uid/class/:cid`;
var ts = "/user/thangdjw/class/pt12354";
var reg = new RegExp(`/user/([\\w\\d_\\-+]*)/class/([\\w\\d_\\-+]*)`);

var c1 = ["a", "b", "c", "d", "e"];
var a = [];

var c2 = {
    a : null,
    b : null,
    c : null,
    d : null,
    e : null
};

function resortDataIndex(data, argList) {
    if (data == null) return data;
    var resortInput = [];
    argList.forEach((key) => {
        resortInput.push(data[key]);
    });

    return resortInput;
}

compare.comparator({
    v1: () => {
        var i = c1.indexOf('d');
        a[i] = "hello";
        return a;
    },
    v2: () => {
        c2['d'] = "hello";
        a = resortDataIndex(c2, c1);
        return a;
    },
}, {
    round: 8000000
});