const crypto = require("crypto");

function generalSecretKey() {
    return crypto.randomBytes(8).toString("hex");
}

module.exports = generalSecretKey;
