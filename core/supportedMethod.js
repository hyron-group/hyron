const SUPPORTED_METHOD = [
    "GET",
    "POST",
    "HEAD",
    "DELETE",
    "PUT",
    "PATCH",
    "ALL",
    "PRIVATE"
];

/**
 * @description check if hyron supported for this method
 * @static
 * @param {string} method uppercase method name
 * @returns true if supported other is false
 * @memberof RouterFactory
 */
function isSupported(method) {
    return SUPPORTED_METHOD.includes(method);
}

function getAllowMethod(){
    return SUPPORTED_METHOD;
}

module.exports = {isSupported, getAllowMethod};