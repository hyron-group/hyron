/**
 * This fontware used to pass request param (include query, body) into main handle function
 * Feature :
 * - supported to convert string to primitive js type, like boolean, number, array, object
 * - supported for validate input data type with simple comment with syntax : @param arg_name {condition}
 * - support for popular http data protocol like : form-data, urlencoded, raw, binary
 * 
 */
module.exports = require('./ParamParser_fw')