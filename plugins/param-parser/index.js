/**
 * This frontware used to pass request param (include query, body) into main handle function
 * Feature :
 * - supported to convert string to primitive js type, like boolean, number, array, object
 * - support for popular http data protocol like : form-data, urlencoded, raw, binary
 * 
 */
module.exports = {
    frontware: require("./src/paramParser_fw")
};