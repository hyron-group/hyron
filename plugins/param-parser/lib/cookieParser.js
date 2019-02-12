const cookie = require("cookie");

function getCookieData(reqCookies) {
    if (reqCookies == null) return;
    return {
        $cookie: cookie.parse(reqCookies)
    };
}

module.exports = getCookieData;