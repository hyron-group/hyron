const jwt = require("jsonwebtoken");
const crypto = require("crypto");

function decode(token) {
  var data = jwt.decode(token);
  if (data == null) return {};
  return data;
}

function encode(data, secret, config) {
  return jwt.sign(data, secret, config);
}

class TokenManager {
  constructor(token, secret, config) {
    this.data = null;
    this.value = token;
    this.hasChange = false;
    this.secret = secret;
  }

  static generalSecretKey() {
    return crypto.randomBytes(8).toString("hex");
  }

  get(key) {
    if (this.data == null) this.data = decode(this.value);
    return this.data[key];
  }

  set(key, val) {
    if (this.data == null) this.data = decode(this.value);
    this.data[key] = val;
    this.hasChange = true;
  }

  getToken() {
    if (this.hasChange) this.value = encode(this.data, this.secret, this.config);
    return this.value;
  }
}

module.exports = TokenManager;
